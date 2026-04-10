/**
 * Add Exempt Vaults — Whitelist burrow and hibernate vault token accounts
 * so they can transfer $HOGE without hitting "WalletNotRegistered".
 *
 * Run: npx tsx scripts/add-exempt-vaults.ts
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

// Vault token accounts to exempt
const VAULTS = [
  { name: "Burrow HOGE vault", address: "CrPko9yCEcTnw3gp5KF8zrzpTQpWmS6BbczaTkxK83Sk" },
  { name: "Burrow WSOL vault", address: "Ey4x4ASsSx2NBsRAq2cHEY934BLmcpw2EXKfuoveJApn" },
  { name: "Hibernate vault", address: "BYTWvtvekz8Xmdw5eaARKYSQxXTAJzvUdJfFgLxHDEzh" },
  { name: "Hibernate reward vault", address: "2fDPi8h3zFtCeTTr97coznZkoVXH6uNU6B8kDgBgQvsy" },
];

function loadKeypair(filepath: string): Keypair {
  const raw = fs.readFileSync(filepath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

async function main() {
  console.log("ADD EXEMPT VAULTS");
  console.log("==================\n");

  const connection = new Connection(DEVNET_URL, "confirmed");
  const admin = loadKeypair(
    path.resolve(process.env.HOME || "~", ".config/solana/groundhoge-dev.json")
  );

  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(admin), {
    commitment: "confirmed",
  });
  const idl = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../target/idl/groundhoge_hook.json"),
      "utf-8"
    )
  );
  const program = new anchor.Program(idl, provider);

  const [exemptListPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("exempt-list")],
    HOOK_PROGRAM_ID
  );

  console.log("Admin:", admin.publicKey.toBase58());
  console.log("Exempt List PDA:", exemptListPda.toBase58());

  // Add each vault
  for (const vault of VAULTS) {
    const vaultPubkey = new PublicKey(vault.address);
    console.log(`\nAdding: ${vault.name} (${vault.address})...`);

    try {
      const sig = await program.methods
        .addExempt(vaultPubkey)
        .accounts({
          admin: admin.publicKey,
          exemptList: exemptListPda,
        })
        .rpc();
      console.log(`   Added! TX: ${sig}`);
    } catch (err: any) {
      if (err.message?.includes("already") || err.transactionLogs?.some((l: string) => l.includes("already"))) {
        console.log("   Already exempt, skipping.");
      } else {
        console.error("   Failed:");
        if (err.transactionLogs) {
          err.transactionLogs.forEach((log: string) => console.error("   ", log));
        } else {
          console.error("   ", err.message);
        }
      }
    }
  }

  // Fetch and print the exempt list
  console.log("\n\nFinal Exempt List:");
  console.log("------------------");
  try {
    const exemptList = await program.account.exemptList.fetch(exemptListPda);
    const addresses = exemptList.addresses as PublicKey[];
    addresses.forEach((addr, i) => {
      const match = VAULTS.find((v) => v.address === addr.toBase58());
      console.log(`  [${i}] ${addr.toBase58()}${match ? ` (${match.name})` : ""}`);
    });
    console.log(`\nTotal exempt: ${addresses.length}`);
  } catch (err: any) {
    console.error("Failed to fetch exempt list:", err.message);
  }

  console.log("\n==================");
  console.log("DONE");
  console.log("==================");
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  if (err.transactionLogs) {
    err.transactionLogs.forEach((log: string) => console.error("  ", log));
  }
  process.exit(1);
});
