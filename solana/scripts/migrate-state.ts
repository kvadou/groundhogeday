/**
 * Migrate State — Resize on-chain accounts to include new fields.
 *
 * 1. Burrow: migrate_pool (adds paused: bool)
 * 2. Hibernate: migrate_config (adds paused: bool, pending_admin: Pubkey)
 *
 * Run: npx tsx scripts/migrate-state.ts
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

const DEVNET_URL = "https://api.devnet.solana.com";
const BURROW_PROGRAM_ID = new PublicKey("4TJmU197oWhxmjSq5LR8fSvcgy3i6drXhP5zhNzKi9zi");
const HIBERNATE_PROGRAM_ID = new PublicKey("8udHGYeRaqNHAMeK3Br66q4mciViz8dL3D4rtPpUXD6q");

function loadKeypair(filepath: string): Keypair {
  const raw = fs.readFileSync(filepath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

async function main() {
  console.log("STATE MIGRATION");
  console.log("================\n");

  const connection = new Connection(DEVNET_URL, "confirmed");
  const admin = loadKeypair(
    path.resolve(process.env.HOME || "~", ".config/solana/groundhoge-dev.json")
  );
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(admin), {
    commitment: "confirmed",
  });

  const mintInfo = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../mint-info.json"), "utf-8")
  );
  const hogeMint = new PublicKey(mintInfo.mint);

  console.log("Admin:", admin.publicKey.toBase58());
  console.log("HOGE Mint:", hogeMint.toBase58());

  // ── 1. Migrate Burrow Pool ──────────────────────────────────────────

  console.log("\n1. Migrating Burrow Pool...");
  const burrowIdl = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../target/idl/groundhoge_burrow.json"),
      "utf-8"
    )
  );
  const burrowProgram = new anchor.Program(burrowIdl, provider);

  const poolAddress = new PublicKey("4oC28QeV6G2qh6hFTEwLrwpuY1XkK74VGGQbnp5QMJpq");

  // Check current account size
  const poolInfo = await connection.getAccountInfo(poolAddress);
  console.log("   Current pool size:", poolInfo?.data.length, "bytes");

  try {
    const sig = await burrowProgram.methods
      .migratePool()
      .accounts({
        admin: admin.publicKey,
        pool: poolAddress,
        hogeMint: hogeMint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("   Pool migrated! TX:", sig);
    console.log(`   Explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  } catch (err: any) {
    console.error("   Pool migration failed:");
    if (err.transactionLogs) {
      err.transactionLogs.forEach((log: string) => console.error("   ", log));
    } else {
      console.error("   ", err.message);
    }
  }

  // Verify new size
  const poolInfoAfter = await connection.getAccountInfo(poolAddress);
  console.log("   New pool size:", poolInfoAfter?.data.length, "bytes");

  // ── 2. Migrate Hibernate Config ─────────────────────────────────────

  console.log("\n2. Migrating Hibernate Config...");
  const hibernateIdl = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../target/idl/groundhoge_hibernate.json"),
      "utf-8"
    )
  );
  const hibernateProgram = new anchor.Program(hibernateIdl, provider);

  const configAddress = new PublicKey("F1SaGuSvCx757gLX5oMwzSJp2yaHqwmP54TaKFLaB5jW");

  // Check current account size
  const configInfo = await connection.getAccountInfo(configAddress);
  console.log("   Current config size:", configInfo?.data.length, "bytes");

  try {
    const sig = await hibernateProgram.methods
      .migrateConfig()
      .accounts({
        admin: admin.publicKey,
        config: configAddress,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("   Config migrated! TX:", sig);
    console.log(`   Explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  } catch (err: any) {
    console.error("   Config migration failed:");
    if (err.transactionLogs) {
      err.transactionLogs.forEach((log: string) => console.error("   ", log));
    } else {
      console.error("   ", err.message);
    }
  }

  // Verify new size
  const configInfoAfter = await connection.getAccountInfo(configAddress);
  console.log("   New config size:", configInfoAfter?.data.length, "bytes");

  // ── 3. Verify deserialization ──────────────────────────────────────

  console.log("\n3. Verifying deserialization...");

  try {
    const pool = await burrowProgram.account.pool.fetch(poolAddress);
    console.log("   Pool deserialized OK");
    console.log("     admin:", (pool.admin as PublicKey).toBase58());
    console.log("     paused:", pool.paused);
    console.log("     hoge_reserve:", pool.hogeReserve?.toString());
    console.log("     sol_reserve:", pool.solReserve?.toString());
  } catch (err: any) {
    console.error("   Pool deserialization FAILED:", err.message);
  }

  try {
    const config = await hibernateProgram.account.hibernateConfig.fetch(configAddress);
    console.log("   HibernateConfig deserialized OK");
    console.log("     admin:", (config.admin as PublicKey).toBase58());
    console.log("     paused:", config.paused);
    console.log("     pending_admin:", (config.pendingAdmin as PublicKey).toBase58());
    console.log("     total_staked:", config.totalStaked?.toString());
  } catch (err: any) {
    console.error("   HibernateConfig deserialization FAILED:", err.message);
  }

  console.log("\n================");
  console.log("MIGRATION COMPLETE");
  console.log("================");
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  if (err.transactionLogs) {
    err.transactionLogs.forEach((log: string) => console.error("  ", log));
  }
  process.exit(1);
});
