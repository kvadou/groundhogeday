/**
 * The Burrow — Initialize AMM Pool ($HOGE/SOL)
 *
 * 1. Create WSOL account
 * 2. Pause hook (seed > daily limit)
 * 3. Register pool authority with hook
 * 4. Create vault token accounts (client-side)
 * 5. Create pool state (on-chain)
 * 6. Seed liquidity (on-chain)
 * 7. Unpause hook
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAccount,
  createInitializeAccountInstruction,
  getMintLen,
  ExtensionType,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

const DEVNET_URL = "https://api.devnet.solana.com";
const BURROW_PROGRAM_ID = new PublicKey("4TJmU197oWhxmjSq5LR8fSvcgy3i6drXhP5zhNzKi9zi");
const HOOK_PROGRAM_ID = new PublicKey("BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU");

const HOGE_SEED = 1_000; // 1K $HOGE for devnet test (under daily limit)
const SOL_SEED = 0.1;

function loadKeypair(filepath: string): Keypair {
  const raw = fs.readFileSync(filepath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

function loadMintInfo(): any {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, "../mint-info.json"), "utf-8"));
}

async function createTokenAccount(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey,
  tokenProgram: PublicKey,
): Promise<Keypair> {
  const account = Keypair.generate();

  // Get mint info to determine required account size (handles extensions)
  const mintInfo = await connection.getAccountInfo(mint);
  let accountLen: number;
  if (tokenProgram.equals(TOKEN_2022_PROGRAM_ID) && mintInfo) {
    // Token-2022: account needs space for TransferFeeAmount extension
    accountLen = 165 + 108; // base + TransferFeeAmount extension
  } else {
    accountLen = 165; // standard SPL Token account
  }

  const lamports = await connection.getMinimumBalanceForRentExemption(accountLen);

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: account.publicKey,
      space: accountLen,
      lamports,
      programId: tokenProgram,
    }),
    createInitializeAccountInstruction(
      account.publicKey,
      mint,
      owner,
      tokenProgram,
    ),
  );

  await sendAndConfirmTransaction(connection, tx, [payer, account]);
  return account;
}

async function main() {
  console.log("THE BURROW — Initialize AMM Pool");
  console.log("=================================\n");

  const connection = new Connection(DEVNET_URL, "confirmed");
  const admin = loadKeypair(
    path.resolve(process.env.HOME || "~", ".config/solana/groundhoge-dev.json")
  );
  const mintInfo = loadMintInfo();
  const hogeMint = new PublicKey(mintInfo.mint);

  console.log(`Admin: ${admin.publicKey.toBase58()}`);
  console.log(`Balance: ${(await connection.getBalance(admin.publicKey)) / LAMPORTS_PER_SOL} SOL\n`);

  // Derive PDAs
  const [poolPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("burrow-pool"), hogeMint.toBuffer()], BURROW_PROGRAM_ID
  );
  const [poolAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("burrow-auth"), hogeMint.toBuffer()], BURROW_PROGRAM_ID
  );
  const [configPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("hook-config")], HOOK_PROGRAM_ID
  );

  // Load programs
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(admin), { commitment: "confirmed" });
  const hookIdl = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../target/idl/groundhoge_hook.json"), "utf-8"));
  const hookProgram = new anchor.Program(hookIdl, provider);
  const burrowIdl = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../target/idl/groundhoge_burrow.json"), "utf-8"));
  const burrowProgram = new anchor.Program(burrowIdl, provider);

  // ── Step 1: WSOL account ─────────────────────────────────────────
  console.log("Step 1: WSOL account...");
  const adminWsol = getAssociatedTokenAddressSync(NATIVE_MINT, admin.publicKey, false, TOKEN_PROGRAM_ID);
  const solRaw = Math.floor(SOL_SEED * LAMPORTS_PER_SOL);

  const wsolInfo = await connection.getAccountInfo(adminWsol);
  if (wsolInfo) {
    console.log("  WSOL ATA exists, topping up...");
    const topUp = new Transaction().add(
      SystemProgram.transfer({ fromPubkey: admin.publicKey, toPubkey: adminWsol, lamports: solRaw }),
      createSyncNativeInstruction(adminWsol, TOKEN_PROGRAM_ID),
    );
    await sendAndConfirmTransaction(connection, topUp, [admin]);
  } else {
    console.log("  Creating WSOL ATA...");
    const tx = new Transaction().add(
      createAssociatedTokenAccountInstruction(admin.publicKey, adminWsol, admin.publicKey, NATIVE_MINT, TOKEN_PROGRAM_ID),
      SystemProgram.transfer({ fromPubkey: admin.publicKey, toPubkey: adminWsol, lamports: solRaw }),
      createSyncNativeInstruction(adminWsol, TOKEN_PROGRAM_ID),
    );
    await sendAndConfirmTransaction(connection, tx, [admin]);
  }
  console.log("  Done.\n");

  // ── Step 2: Pause hook ───────────────────────────────────────────
  console.log("Step 2: Pausing hook...");
  await hookProgram.methods.setPaused(true).accounts({ admin: admin.publicKey, config: configPDA }).rpc();
  console.log("  Done.\n");

  // ── Step 3: Register pool authority ──────────────────────────────
  console.log("Step 3: Registering pool authority...");
  const [dailyCounterPool] = PublicKey.findProgramAddressSync(
    [Buffer.from("daily-limit"), poolAuthority.toBuffer()], HOOK_PROGRAM_ID
  );
  const dailyCounterInfo = await connection.getAccountInfo(dailyCounterPool);
  if (dailyCounterInfo) {
    console.log("  Already registered.\n");
  } else {
    await hookProgram.methods.registerWallet().accounts({
      payer: admin.publicKey, wallet: poolAuthority, dailyCounter: dailyCounterPool, systemProgram: SystemProgram.programId,
    }).rpc();
    console.log(`  Authority: ${poolAuthority.toBase58()}\n`);
  }

  // ── Step 4: Create vault accounts ────────────────────────────────
  console.log("Step 4: Creating vault accounts...");

  // Check if pool exists and has vaults from a previous run
  let vaultHogeKey: PublicKey;
  let vaultWsolKey: PublicKey;
  const existingPool = await connection.getAccountInfo(poolPDA);
  if (existingPool) {
    // Decode pool to get existing vault addresses
    const poolData = burrowProgram.coder.accounts.decode("pool", existingPool.data);
    vaultHogeKey = poolData.vaultHoge;
    vaultWsolKey = poolData.vaultWsol;
    console.log(`  Using existing vaults from pool.`);
  } else {
    const vhKp = await createTokenAccount(connection, admin, hogeMint, poolAuthority, TOKEN_2022_PROGRAM_ID);
    vaultHogeKey = vhKp.publicKey;
    const vwKp = await createTokenAccount(connection, admin, NATIVE_MINT, poolAuthority, TOKEN_PROGRAM_ID);
    vaultWsolKey = vwKp.publicKey;
  }
  console.log(`  Vault $HOGE: ${vaultHogeKey.toBase58()}`);
  console.log(`  Vault WSOL:  ${vaultWsolKey.toBase58()}\n`);

  // ── Step 5: Create pool state ────────────────────────────────────
  console.log("Step 5: Creating pool...");
  const poolAccount = await connection.getAccountInfo(poolPDA);
  if (poolAccount) {
    console.log("  Pool already exists, skipping.\n");
  } else {
    await burrowProgram.methods.createPool().accounts({
      admin: admin.publicKey,
      pool: poolPDA,
      poolAuthority: poolAuthority,
      hogeMint: hogeMint,
      wsolMint: NATIVE_MINT,
      vaultHoge: vaultHogeKey,
      vaultWsol: vaultWsolKey,
      systemProgram: SystemProgram.programId,
    }).rpc();
    console.log("  Pool created.\n");
  }

  // ── Step 6: Seed liquidity (direct transfers + sync) ──────────────
  console.log("Step 6: Seeding liquidity...");
  const hogeRaw = HOGE_SEED * 100; // 2 decimals
  const adminHoge = getAssociatedTokenAddressSync(hogeMint, admin.publicKey, false, TOKEN_2022_PROGRAM_ID);

  // 6a: Transfer $HOGE directly to vault (uses addExtraAccountMetasForExecute)
  console.log("  Transferring $HOGE to vault...");
  const { addExtraAccountMetasForExecute, createTransferCheckedInstruction } = await import("@solana/spl-token");
  const hogeTransferIx = createTransferCheckedInstruction(
    adminHoge, hogeMint, vaultHogeKey, admin.publicKey, hogeRaw, 2, [], TOKEN_2022_PROGRAM_ID,
  );
  await addExtraAccountMetasForExecute(
    connection, hogeTransferIx, HOOK_PROGRAM_ID,
    adminHoge, hogeMint, vaultHogeKey, admin.publicKey, hogeRaw, "confirmed",
  );
  await sendAndConfirmTransaction(connection, new Transaction().add(hogeTransferIx), [admin]);

  // 6b: Transfer WSOL directly to vault
  console.log("  Transferring WSOL to vault...");
  const wsolTransferIx = createTransferCheckedInstruction(
    adminWsol, NATIVE_MINT, vaultWsolKey, admin.publicKey, solRaw, 9, [], TOKEN_PROGRAM_ID,
  );
  await sendAndConfirmTransaction(connection, new Transaction().add(wsolTransferIx), [admin]);

  // 6c: Sync pool reserves from vault balances
  console.log("  Syncing reserves...");
  await burrowProgram.methods.syncReserves().accounts({
    admin: admin.publicKey,
    pool: poolPDA,
    vaultHoge: vaultHogeKey,
    vaultWsol: vaultWsolKey,
  }).rpc();
  console.log(`  Seeded: ${HOGE_SEED} $HOGE + ${SOL_SEED} SOL\n`);

  // ── Step 7: Unpause hook ─────────────────────────────────────────
  console.log("Step 7: Unpausing hook...");
  await hookProgram.methods.setPaused(false).accounts({ admin: admin.publicKey, config: configPDA }).rpc();
  console.log("  Done.\n");

  // ── Summary ──────────────────────────────────────────────────────
  console.log("=================================");
  console.log("THE BURROW IS OPEN!");
  console.log("=================================\n");
  console.log(`Pool:       ${poolPDA.toBase58()}`);
  console.log(`Authority:  ${poolAuthority.toBase58()}`);
  console.log(`Vault HOGE: ${vaultHogeKey.toBase58()}`);
  console.log(`Vault WSOL: ${vaultWsolKey.toBase58()}`);
  console.log(`Reserves:   ${HOGE_SEED} $HOGE / ${SOL_SEED} SOL`);

  const poolInfo = {
    pool: poolPDA.toBase58(),
    poolAuthority: poolAuthority.toBase58(),
    vaultHoge: vaultHogeKey.toBase58(),
    vaultWsol: vaultWsolKey.toBase58(),
    burrowProgram: BURROW_PROGRAM_ID.toBase58(),
    hogeMint: hogeMint.toBase58(),
    network: "devnet",
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.resolve(__dirname, "../pool-info.json"), JSON.stringify(poolInfo, null, 2));
  console.log("\nPool info saved.");
}

main().catch((err) => {
  console.error("\nFATAL ERROR:", err);
  process.exit(1);
});
