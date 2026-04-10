/**
 * Setup Exempt List — Initialize ExemptList PDA and reinitialize ExtraAccountMetaList
 * to include the exempt list as a 4th extra account.
 *
 * Steps:
 * 1. Create ExemptList PDA (admin-only)
 * 2. Reinitialize ExtraAccountMetaList with 4 extra accounts
 */

import {
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
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
  const mintInfo = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../mint-info.json"), "utf-8")
  );

  const hogeMint = new PublicKey(mintInfo.mint);

  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(admin),
    { commitment: "confirmed" }
  );
  const idl = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../target/idl/groundhoge_hook.json"),
      "utf-8"
    )
  );
  const program = new anchor.Program(idl, provider);

  // Derive PDAs
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("hook-config")],
    HOOK_PROGRAM_ID
  );
  const [exemptListPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("exempt-list")],
    HOOK_PROGRAM_ID
  );
  const [extraMetasPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("extra-account-metas"), hogeMint.toBuffer()],
    HOOK_PROGRAM_ID
  );

  console.log("Admin:", admin.publicKey.toBase58());
  console.log("Mint:", hogeMint.toBase58());
  console.log("Config PDA:", configPda.toBase58());
  console.log("Exempt List PDA:", exemptListPda.toBase58());
  console.log("Extra Metas PDA:", extraMetasPda.toBase58());

  // Step 1: Initialize ExemptList
  console.log("\n1. Initializing ExemptList...");
  try {
    const existingAccount = await connection.getAccountInfo(exemptListPda);
    if (existingAccount && existingAccount.data.length > 0) {
      console.log("   ExemptList already exists, skipping init.");
    } else {
      throw new Error("not initialized");
    }
  } catch {
    try {
      const sig = await program.methods
        .initExemptList()
        .accounts({
          admin: admin.publicKey,
          config: configPda,
          exemptList: exemptListPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      console.log("   ExemptList initialized. TX:", sig);
    } catch (err: any) {
      if (err.message?.includes("already in use")) {
        console.log("   ExemptList already exists (account in use).");
      } else {
        throw err;
      }
    }
  }

  // Step 2: Reinitialize ExtraAccountMetaList
  console.log("\n2. Reinitializing ExtraAccountMetaList with exempt list support...");
  try {
    const sig = await program.methods
      .reinitializeExtraAccountMetaList()
      .accounts({
        payer: admin.publicKey,
        mint: hogeMint,
        extraAccountMetaList: extraMetasPda,
        config: configPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("   ExtraAccountMetaList reinitialized. TX:", sig);
  } catch (err: any) {
    console.error("   Reinitialize failed:");
    if (err.transactionLogs) {
      err.transactionLogs.forEach((log: string) => console.error("   ", log));
    } else {
      console.error("   ", err.message);
    }
    process.exit(1);
  }

  // Verify
  console.log("\n3. Verification...");
  const exemptAccount = await connection.getAccountInfo(exemptListPda);
  console.log("   ExemptList account size:", exemptAccount?.data.length, "bytes");
  console.log("   ExemptList owner:", exemptAccount?.owner.toBase58());

  const metasAccount = await connection.getAccountInfo(extraMetasPda);
  console.log("   ExtraAccountMetaList size:", metasAccount?.data.length, "bytes");
  console.log("   ExtraAccountMetaList owner:", metasAccount?.owner.toBase58());

  console.log("\nDone! Exempt list is ready for DEX pool vault whitelisting.");
  console.log("Next: use add_exempt to whitelist DEX pool vault addresses.");
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  if (err.transactionLogs) {
    err.transactionLogs.forEach((log: string) => console.error("  ", log));
  }
  process.exit(1);
});
