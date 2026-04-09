/**
 * Test: Swap SOL for $HOGE via The Burrow (CPI through Token-2022 with TransferHook).
 * This tests the fix for the CPI + Hook issue.
 */

import {
  Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction,
  SystemProgram, LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  addExtraAccountMetasForExecute,
  NATIVE_MINT,
  createSyncNativeInstruction,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

const DEVNET_URL = "https://api.devnet.solana.com";
const HOOK_PROGRAM_ID = new PublicKey("BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU");
const BURROW_PROGRAM_ID = new PublicKey("4TJmU197oWhxmjSq5LR8fSvcgy3i6drXhP5zhNzKi9zi");

function loadKeypair(filepath: string): Keypair {
  const raw = fs.readFileSync(filepath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

async function main() {
  const connection = new Connection(DEVNET_URL, "confirmed");
  const admin = loadKeypair(
    path.resolve(process.env.HOME || "~", ".config/solana/groundhoge-dev.json")
  );
  const mintInfo = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../mint-info.json"), "utf-8"));
  const poolInfo = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../pool-info.json"), "utf-8"));

  const hogeMint = new PublicKey(mintInfo.mint);
  const pool = new PublicKey(poolInfo.pool);
  const poolAuthority = new PublicKey(poolInfo.poolAuthority);
  const vaultHoge = new PublicKey(poolInfo.vaultHoge);
  const vaultWsol = new PublicKey(poolInfo.vaultWsol);

  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(admin), { commitment: "confirmed" });
  const burrowIdl = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../target/idl/groundhoge_burrow.json"), "utf-8"));
  const burrowProgram = new anchor.Program(burrowIdl, provider);

  // User's token accounts
  const userHoge = getAssociatedTokenAddressSync(hogeMint, admin.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  const userWsol = getAssociatedTokenAddressSync(NATIVE_MINT, admin.publicKey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

  console.log("Admin:", admin.publicKey.toBase58());
  console.log("Pool:", pool.toBase58());
  console.log("User HOGE ATA:", userHoge.toBase58());
  console.log("User WSOL ATA:", userWsol.toBase58());

  // Ensure user has a WSOL ATA with some wrapped SOL
  console.log("\n1. Setting up WSOL...");
  const wsolBalance = await connection.getBalance(userWsol).catch(() => 0);
  if (wsolBalance === 0) {
    const tx = new Transaction();
    // Create WSOL ATA if needed
    try {
      await connection.getAccountInfo(userWsol);
    } catch {
      tx.add(createAssociatedTokenAccountInstruction(
        admin.publicKey, userWsol, admin.publicKey, NATIVE_MINT, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
      ));
    }
    // Transfer 0.01 SOL into it and sync
    tx.add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: userWsol,
        lamports: 0.01 * LAMPORTS_PER_SOL,
      }),
      createSyncNativeInstruction(userWsol, TOKEN_PROGRAM_ID),
    );
    await sendAndConfirmTransaction(connection, tx, [admin]);
    console.log("   WSOL funded with 0.01 SOL");
  } else {
    console.log("   WSOL already funded");
  }

  // Build the swap instruction
  console.log("\n2. Building swap: 0.001 SOL → $HOGE...");
  const solIn = new anchor.BN(0.001 * LAMPORTS_PER_SOL); // 0.001 SOL = 1,000,000 lamports
  const minHogeOut = new anchor.BN(0); // No slippage protection for test

  // We need to figure out what remaining accounts the hook needs
  // Build a dummy transferChecked instruction to resolve extra metas
  const { createTransferCheckedInstruction } = await import("@solana/spl-token");
  const dummyTransferIx = createTransferCheckedInstruction(
    vaultHoge, hogeMint, userHoge, poolAuthority, 1, 2, [], TOKEN_2022_PROGRAM_ID,
  );

  // Resolve the extra account metas for the hook
  await addExtraAccountMetasForExecute(
    connection, dummyTransferIx, HOOK_PROGRAM_ID,
    vaultHoge, hogeMint, userHoge, poolAuthority, 1, "confirmed",
  );

  // Extract the extra accounts (skip the first 4 standard TransferChecked accounts)
  const extraAccountMetas = dummyTransferIx.keys.slice(4).map(k => ({
    pubkey: k.pubkey,
    isSigner: false, // None of the hook accounts are signers
    isWritable: k.isWritable,
  }));

  console.log("   Extra hook accounts:");
  extraAccountMetas.forEach((k, i) => {
    console.log(`     [${i}] ${k.pubkey.toBase58()} writable=${k.isWritable}`);
  });

  // Call swap_sol_for_hoge
  console.log("\n3. Sending swap transaction...");
  try {
    const sig = await burrowProgram.methods
      .swapSolForHoge(solIn, minHogeOut)
      .accounts({
        user: admin.publicKey,
        pool,
        poolAuthority,
        hogeMint,
        wsolMint: NATIVE_MINT,
        vaultHoge,
        vaultWsol,
        userWsol,
        userHoge,
        tokenProgram: TOKEN_PROGRAM_ID,
        token2022Program: TOKEN_2022_PROGRAM_ID,
      })
      .remainingAccounts(extraAccountMetas)
      .rpc();

    console.log(`\n   SUCCESS! Swap completed.`);
    console.log(`   TX: ${sig}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  } catch (err: any) {
    console.error("\n   SWAP FAILED:");
    if (err.transactionLogs) {
      err.transactionLogs.forEach((log: string) => console.error("   ", log));
    } else {
      console.error("   ", err.message);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  process.exit(1);
});
