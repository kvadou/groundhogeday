/**
 * Test: transfer to an UNREGISTERED wallet (no daily_counter PDA).
 * Verifies the hook gracefully skips daily limit enforcement.
 */

import {
  Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferCheckedInstruction, addExtraAccountMetasForExecute,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import * as fs from "fs";
import * as path from "path";

const DEVNET_URL = "https://api.devnet.solana.com";
const HOOK_PROGRAM_ID = new PublicKey("BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU");

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
  const hogeMint = new PublicKey(mintInfo.mint);

  const adminHoge = getAssociatedTokenAddressSync(hogeMint, admin.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

  // Create a fresh wallet — DO NOT register it with the hook
  const recipient = Keypair.generate();
  const recipientHoge = getAssociatedTokenAddressSync(hogeMint, recipient.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

  console.log("Admin:", admin.publicKey.toBase58());
  console.log("Recipient (UNREGISTERED):", recipient.publicKey.toBase58());

  console.log("\n1. Creating recipient ATA...");
  const createAtaTx = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      admin.publicKey, recipientHoge, recipient.publicKey, hogeMint, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  );
  await sendAndConfirmTransaction(connection, createAtaTx, [admin]);
  console.log("   ATA created.");

  // Skip registration — go straight to transfer
  console.log("\n2. Transferring 1 $HOGE to unregistered wallet (no register_wallet call)...");
  const amount = 100; // 1 $HOGE (2 decimals)
  const transferIx = createTransferCheckedInstruction(
    adminHoge, hogeMint, recipientHoge, admin.publicKey, amount, 2, [], TOKEN_2022_PROGRAM_ID,
  );

  await addExtraAccountMetasForExecute(
    connection, transferIx, HOOK_PROGRAM_ID,
    adminHoge, hogeMint, recipientHoge, admin.publicKey, amount, "confirmed",
  );

  const tx = new Transaction().add(transferIx);
  const sig = await sendAndConfirmTransaction(connection, tx, [admin]);
  console.log(`\n   SUCCESS! Unregistered wallet transfer worked.`);
  console.log(`   TX: ${sig}`);
  console.log(`   Explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
}

main().catch((err) => {
  console.error("\nFAILED:", err.transactionLogs || err.message);
  process.exit(1);
});
