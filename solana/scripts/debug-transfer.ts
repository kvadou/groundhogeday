/**
 * Debug: test a direct Token-2022 transferChecked with the transfer hook.
 * If this works, the hook accounts are correct. Then we know the CPI issue is in the Burrow program.
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

  // Create a second wallet to transfer to
  const recipient = Keypair.generate();
  const recipientHoge = getAssociatedTokenAddressSync(hogeMint, recipient.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);

  console.log("Creating recipient ATA...");
  const createAtaTx = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      admin.publicKey, recipientHoge, recipient.publicKey, hogeMint, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  );
  await sendAndConfirmTransaction(connection, createAtaTx, [admin]);

  // Register recipient with hook
  console.log("Registering recipient wallet with hook...");
  const hookIdl = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../target/idl/groundhoge_hook.json"), "utf-8"));
  const anchor = require("@coral-xyz/anchor");
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(admin), { commitment: "confirmed" });
  const hookProgram = new anchor.Program(hookIdl, provider);

  const [dailyCounter] = PublicKey.findProgramAddressSync(
    [Buffer.from("daily-limit"), recipient.publicKey.toBuffer()], HOOK_PROGRAM_ID
  );
  await hookProgram.methods.registerWallet().accounts({
    payer: admin.publicKey, wallet: recipient.publicKey, dailyCounter,
    systemProgram: new PublicKey("11111111111111111111111111111111"),
  }).rpc();

  // Build transfer instruction
  console.log("Building transfer with hook accounts...");
  const amount = 100; // 1 $HOGE (2 decimals)
  const transferIx = createTransferCheckedInstruction(
    adminHoge, hogeMint, recipientHoge, admin.publicKey, amount, 2, [], TOKEN_2022_PROGRAM_ID,
  );

  // Add transfer hook extra accounts
  await addExtraAccountMetasForExecute(
    connection, transferIx, HOOK_PROGRAM_ID,
    adminHoge, hogeMint, recipientHoge, admin.publicKey, amount, "confirmed",
  );

  console.log("\nAccounts in transfer instruction:");
  transferIx.keys.forEach((k, i) => {
    console.log(`  [${i}] ${k.pubkey.toBase58()} signer=${k.isSigner} writable=${k.isWritable}`);
  });

  console.log("\nSending transfer...");
  const tx = new Transaction().add(transferIx);
  const sig = await sendAndConfirmTransaction(connection, tx, [admin]);
  console.log(`SUCCESS! TX: ${sig}`);
}

main().catch((err) => {
  console.error("\nFATAL:", err.transactionLogs || err.message);
  process.exit(1);
});
