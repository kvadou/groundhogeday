/**
 * Groundhoge Day — Admin Shadow/No-Shadow Trigger
 *
 * February 2nd Admin Actions:
 *   - SHADOW:    Burn 6% of circulating supply from ALL wallets via PermanentDelegate
 *   - NO SHADOW: Mint 3.9% new supply to admin wallet
 *
 * Usage:
 *   npx ts-node scripts/admin-shadow.ts shadow    # 6 weeks of winter!
 *   npx ts-node scripts/admin-shadow.ts no-shadow  # Early spring!
 *   npx ts-node scripts/admin-shadow.ts pause       # Pause the hook
 *   npx ts-node scripts/admin-shadow.ts unpause     # Resume the hook
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createBurnInstruction,
  createMintToInstruction,
  getAccount,
  getMint,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

// ── Config ─────────────────────────────────────────────────────────────

const DEVNET_URL = "https://api.devnet.solana.com";
const DECIMALS = 2;

// ── Helpers ────────────────────────────────────────────────────────────

function loadKeypair(filepath: string): Keypair {
  const raw = fs.readFileSync(filepath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

function loadMintInfo(): any {
  const p = path.resolve(__dirname, "../mint-info.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

// ── Commands ───────────────────────────────────────────────────────────

async function shadowBurn(connection: Connection, admin: Keypair, mintPubkey: PublicKey) {
  console.log("\n6 WEEKS OF WINTER! Executing Shadow Burn (6%)...\n");

  const mintInfo = await getMint(connection, mintPubkey, "confirmed", TOKEN_2022_PROGRAM_ID);
  const currentSupply = mintInfo.supply;
  console.log(`  Current supply: ${Number(currentSupply) / 10 ** DECIMALS} $HOGE`);

  // 6% burn
  const burnAmount = (currentSupply * BigInt(6)) / BigInt(100);
  console.log(`  Burn amount (6%): ${Number(burnAmount) / 10 ** DECIMALS} $HOGE`);

  // For devnet demo: burn from admin's ATA using PermanentDelegate authority
  const adminATA = getAssociatedTokenAddressSync(
    mintPubkey,
    admin.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const accountInfo = await getAccount(connection, adminATA, "confirmed", TOKEN_2022_PROGRAM_ID);
  const walletBalance = accountInfo.amount;
  const walletBurn = (walletBalance * BigInt(6)) / BigInt(100);
  console.log(`  Admin wallet balance: ${Number(walletBalance) / 10 ** DECIMALS} $HOGE`);
  console.log(`  Burning from admin: ${Number(walletBurn) / 10 ** DECIMALS} $HOGE`);

  // PermanentDelegate can burn from any account
  const tx = new Transaction().add(
    createBurnInstruction(
      adminATA,        // token account to burn from
      mintPubkey,      // mint
      admin.publicKey, // authority (PermanentDelegate)
      walletBurn,
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [admin]);
  console.log(`  TX: ${sig}`);

  const newSupply = (await getMint(connection, mintPubkey, "confirmed", TOKEN_2022_PROGRAM_ID)).supply;
  console.log(`  New supply: ${Number(newSupply) / 10 ** DECIMALS} $HOGE`);
  console.log("\n  The Oracle has spoken. Winter is coming.\n");
}

async function noShadowMint(connection: Connection, admin: Keypair, mintPubkey: PublicKey) {
  console.log("\nEARLY SPRING! Executing No-Shadow Mint (3.9%)...\n");

  const mintInfo = await getMint(connection, mintPubkey, "confirmed", TOKEN_2022_PROGRAM_ID);
  const currentSupply = mintInfo.supply;
  console.log(`  Current supply: ${Number(currentSupply) / 10 ** DECIMALS} $HOGE`);

  // 3.9% mint (Phil's 39% accuracy)
  const mintAmount = (currentSupply * BigInt(39)) / BigInt(1000);
  console.log(`  Mint amount (3.9%): ${Number(mintAmount) / 10 ** DECIMALS} $HOGE`);

  const adminATA = getAssociatedTokenAddressSync(
    mintPubkey,
    admin.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const tx = new Transaction().add(
    createMintToInstruction(
      mintPubkey,
      adminATA,
      admin.publicKey, // mint authority (retained)
      mintAmount,
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [admin]);
  console.log(`  TX: ${sig}`);

  const newSupply = (await getMint(connection, mintPubkey, "confirmed", TOKEN_2022_PROGRAM_ID)).supply;
  console.log(`  New supply: ${Number(newSupply) / 10 ** DECIMALS} $HOGE`);
  console.log("\n  The Oracle sees no shadow! Spring has sprung!\n");
}

async function setPaused(connection: Connection, admin: Keypair, paused: boolean) {
  const action = paused ? "PAUSING" : "UNPAUSING";
  console.log(`\n${action} the transfer hook...\n`);

  const info = loadMintInfo();
  const idlPath = path.resolve(__dirname, "../target/idl/groundhoge_hook.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(admin),
    { commitment: "confirmed" }
  );
  const program = new anchor.Program(idl, provider);

  const sig = await program.methods
    .setPaused(paused)
    .accounts({
      admin: admin.publicKey,
      config: new PublicKey(info.config),
    })
    .rpc();

  console.log(`  TX: ${sig}`);
  console.log(`  Hook is now ${paused ? "PAUSED" : "ACTIVE"}\n`);
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  const command = process.argv[2];
  if (!command || !["shadow", "no-shadow", "pause", "unpause"].includes(command)) {
    console.log("Usage: npx ts-node scripts/admin-shadow.ts <shadow|no-shadow|pause|unpause>");
    process.exit(1);
  }

  const connection = new Connection(DEVNET_URL, "confirmed");
  const admin = loadKeypair(
    path.resolve(process.env.HOME || "~", ".config/solana/groundhoge-dev.json")
  );
  const info = loadMintInfo();
  const mintPubkey = new PublicKey(info.mint);

  console.log(`Admin: ${admin.publicKey.toBase58()}`);
  console.log(`Mint:  ${mintPubkey.toBase58()}`);

  switch (command) {
    case "shadow":
      await shadowBurn(connection, admin, mintPubkey);
      break;
    case "no-shadow":
      await noShadowMint(connection, admin, mintPubkey);
      break;
    case "pause":
      await setPaused(connection, admin, true);
      break;
    case "unpause":
      await setPaused(connection, admin, false);
      break;
  }
}

main().catch((err) => {
  console.error("\nFATAL ERROR:", err);
  process.exit(1);
});
