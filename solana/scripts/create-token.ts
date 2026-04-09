/**
 * Groundhoge Day — $HOGE Token Creation Script
 *
 * Creates the Token-2022 mint with all extensions:
 * 1. TransferFeeConfig (6.25% tax)
 * 2. TransferHook (daily sell limit + 109th tx trap)
 * 3. PermanentDelegate (for shadow burns)
 *
 * Then mints the initial supply of 1,883,000,000 tokens (2 decimals).
 *
 * IMPORTANT: Extensions must be initialized BEFORE the mint itself.
 */

import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  createInitializeMintInstruction,
  createInitializeTransferFeeConfigInstruction,
  createInitializeTransferHookInstruction,
  createInitializePermanentDelegateInstruction,
  getMintLen,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

// ── Config ─────────────────────────────────────────────────────────────

const DEVNET_URL = "https://api.devnet.solana.com";
const HOOK_PROGRAM_ID = new PublicKey(
  "BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU"
);

// Token params
const DECIMALS = 2; // February 2nd
const FEE_BASIS_POINTS = 625; // 6.25%
const MAX_FEE = BigInt(Number.MAX_SAFE_INTEGER); // effectively unlimited
const INITIAL_SUPPLY = BigInt(1_883_000_000) * BigInt(10 ** DECIMALS); // 188,300,000,000 raw

// ── Helpers ────────────────────────────────────────────────────────────

function loadKeypair(filepath: string): Keypair {
  const raw = fs.readFileSync(filepath, "utf-8");
  const secret = Uint8Array.from(JSON.parse(raw));
  return Keypair.fromSecretKey(secret);
}

function getExtraAccountMetaListPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("extra-account-metas"), mint.toBuffer()],
    HOOK_PROGRAM_ID
  );
}

function getGlobalCounterPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("tx-counter")],
    HOOK_PROGRAM_ID
  );
}

function getConfigPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("hook-config")],
    HOOK_PROGRAM_ID
  );
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log("🦫 GROUNDHOGE DAY — $HOGE Token Creation");
  console.log("=========================================\n");

  // Connect to devnet
  const connection = new Connection(DEVNET_URL, "confirmed");

  // Load admin keypair
  const adminKeypath = path.resolve(
    process.env.HOME || "~",
    ".config/solana/groundhoge-dev.json"
  );
  const admin = loadKeypair(adminKeypath);
  console.log(`Admin: ${admin.publicKey.toBase58()}`);

  const balance = await connection.getBalance(admin.publicKey);
  console.log(`Balance: ${balance / 1e9} SOL\n`);

  // ── Step 1: Create Mint Account ──────────────────────────────────

  console.log("Step 1: Creating mint account with extensions...");

  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  console.log(`  Mint: ${mint.toBase58()}`);

  // Calculate space needed for all 3 extensions
  const extensions = [
    ExtensionType.TransferFeeConfig,
    ExtensionType.TransferHook,
    ExtensionType.PermanentDelegate,
  ];
  const mintLen = getMintLen(extensions);
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
  console.log(`  Space: ${mintLen} bytes, Rent: ${lamports / 1e9} SOL`);

  // Build transaction: create account + init extensions + init mint
  // ORDER MATTERS: extensions must be initialized BEFORE the mint
  const tx1 = new Transaction().add(
    // Create the account
    SystemProgram.createAccount({
      fromPubkey: admin.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    // Init TransferFeeConfig (6.25% tax)
    createInitializeTransferFeeConfigInstruction(
      mint,
      admin.publicKey, // fee config authority
      admin.publicKey, // withdraw withheld authority
      FEE_BASIS_POINTS,
      MAX_FEE,
      TOKEN_2022_PROGRAM_ID
    ),
    // Init TransferHook (points to our Anchor program)
    createInitializeTransferHookInstruction(
      mint,
      admin.publicKey, // hook authority
      HOOK_PROGRAM_ID, // the transfer hook program
      TOKEN_2022_PROGRAM_ID
    ),
    // Init PermanentDelegate (for shadow burns)
    createInitializePermanentDelegateInstruction(
      mint,
      admin.publicKey, // permanent delegate
      TOKEN_2022_PROGRAM_ID
    ),
    // Init the Mint itself (LAST)
    createInitializeMintInstruction(
      mint,
      DECIMALS,
      admin.publicKey, // mint authority (retained for no-shadow mints)
      null, // no freeze authority
      TOKEN_2022_PROGRAM_ID
    )
  );

  const sig1 = await sendAndConfirmTransaction(connection, tx1, [
    admin,
    mintKeypair,
  ]);
  console.log(`  TX: ${sig1}`);
  console.log(
    `  Explorer: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`
  );
  console.log("  Done!\n");

  // ── Step 2: Initialize Transfer Hook Extra Account Metas ─────────

  console.log("Step 2: Initializing transfer hook extra account metas...");

  const [extraAccountMetaListPDA] = getExtraAccountMetaListPDA(mint);
  const [globalCounterPDA] = getGlobalCounterPDA();
  const [configPDA] = getConfigPDA();

  console.log(`  ExtraAccountMetaList PDA: ${extraAccountMetaListPDA.toBase58()}`);
  console.log(`  GlobalCounter PDA: ${globalCounterPDA.toBase58()}`);
  console.log(`  Config PDA: ${configPDA.toBase58()}`);

  // Load the IDL for the Anchor program
  const idlPath = path.resolve(
    __dirname,
    "../target/idl/groundhoge_hook.json"
  );
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(admin),
    { commitment: "confirmed" }
  );
  const program = new anchor.Program(idl, provider);

  const sig2 = await program.methods
    .initializeExtraAccountMetaList()
    .accounts({
      payer: admin.publicKey,
      mint: mint,
      extraAccountMetaList: extraAccountMetaListPDA,
      globalCounter: globalCounterPDA,
      config: configPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`  TX: ${sig2}`);
  console.log("  Done!\n");

  // ── Step 3: Create Admin Token Account + Mint Initial Supply ─────

  console.log("Step 3: Minting initial supply...");

  const adminATA = getAssociatedTokenAddressSync(
    mint,
    admin.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  console.log(`  Admin ATA: ${adminATA.toBase58()}`);

  const tx3 = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      admin.publicKey,
      adminATA,
      admin.publicKey,
      mint,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    ),
    createMintToInstruction(
      mint,
      adminATA,
      admin.publicKey, // mint authority
      INITIAL_SUPPLY,
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );

  const sig3 = await sendAndConfirmTransaction(connection, tx3, [admin]);
  console.log(`  TX: ${sig3}`);
  console.log(
    `  Minted: ${Number(INITIAL_SUPPLY) / 10 ** DECIMALS} $HOGE (${INITIAL_SUPPLY} raw units)`
  );
  console.log("  Done!\n");

  // ── Step 4: Register Admin Wallet for Trading ────────────────────

  console.log("Step 4: Registering admin wallet for daily limit tracking...");

  const [dailyCounterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("daily-limit"), admin.publicKey.toBuffer()],
    HOOK_PROGRAM_ID
  );

  const sig4 = await program.methods
    .registerWallet()
    .accounts({
      payer: admin.publicKey,
      wallet: admin.publicKey,
      dailyCounter: dailyCounterPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`  TX: ${sig4}`);
  console.log("  Done!\n");

  // ── Summary ──────────────────────────────────────────────────────

  console.log("=========================================");
  console.log("$HOGE TOKEN CREATED SUCCESSFULLY!");
  console.log("=========================================\n");
  console.log(`Mint Address:        ${mint.toBase58()}`);
  console.log(`Hook Program:        ${HOOK_PROGRAM_ID.toBase58()}`);
  console.log(`Admin:               ${admin.publicKey.toBase58()}`);
  console.log(`Initial Supply:      1,883,000,000 $HOGE`);
  console.log(`Decimals:            ${DECIMALS}`);
  console.log(`Transfer Fee:        6.25%`);
  console.log(`Permanent Delegate:  ${admin.publicKey.toBase58()}`);
  console.log(`Daily Sell Limit:    1,883 $HOGE / wallet / day`);
  console.log(`109th Tx Trap:       Active`);
  console.log(
    `\nExplorer: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`
  );

  // Save mint info for other scripts
  const mintInfo = {
    mint: mint.toBase58(),
    mintKeypair: Array.from(mintKeypair.secretKey),
    hookProgram: HOOK_PROGRAM_ID.toBase58(),
    admin: admin.publicKey.toBase58(),
    extraAccountMetaList: extraAccountMetaListPDA.toBase58(),
    globalCounter: globalCounterPDA.toBase58(),
    config: configPDA.toBase58(),
    network: "devnet",
    createdAt: new Date().toISOString(),
  };
  const outPath = path.resolve(__dirname, "../mint-info.json");
  fs.writeFileSync(outPath, JSON.stringify(mintInfo, null, 2));
  console.log(`\nMint info saved to: ${outPath}`);
}

main().catch((err) => {
  console.error("\nFATAL ERROR:", err);
  process.exit(1);
});
