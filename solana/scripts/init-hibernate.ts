/**
 * Initialize the Hibernation Portal — creates config, vault, and reward vault PDAs
 */

import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

const DEVNET_URL = "https://api.devnet.solana.com";
const HIBERNATE_PROGRAM_ID = new PublicKey("8udHGYeRaqNHAMeK3Br66q4mciViz8dL3D4rtPpUXD6q");

function loadKeypair(filepath: string): Keypair {
  const raw = fs.readFileSync(filepath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

async function main() {
  console.log("HIBERNATION PORTAL — Initialize");
  console.log("================================\n");

  const connection = new Connection(DEVNET_URL, "confirmed");
  const admin = loadKeypair(
    path.resolve(process.env.HOME || "~", ".config/solana/groundhoge-dev.json")
  );
  const mintInfo = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../mint-info.json"), "utf-8")
  );
  const hogeMint = new PublicKey(mintInfo.mint);

  console.log(`Admin:    ${admin.publicKey.toBase58()}`);
  console.log(`Mint:     ${hogeMint.toBase58()}`);
  console.log(`Balance:  ${(await connection.getBalance(admin.publicKey)) / LAMPORTS_PER_SOL} SOL\n`);

  // Load IDL and create program
  const idl = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../target/idl/groundhoge_hibernate.json"), "utf-8")
  );
  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(admin),
    { commitment: "confirmed" }
  );
  const program = new anchor.Program(idl, provider);

  // Derive PDAs
  const [configPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("hibernate-config")],
    HIBERNATE_PROGRAM_ID
  );
  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("hibernate-vault"), hogeMint.toBuffer()],
    HIBERNATE_PROGRAM_ID
  );
  const [rewardVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("hibernate-rewards"), hogeMint.toBuffer()],
    HIBERNATE_PROGRAM_ID
  );

  console.log("PDAs:");
  console.log(`  Config:       ${configPDA.toBase58()}`);
  console.log(`  Vault:        ${vaultPDA.toBase58()}`);
  console.log(`  Reward Vault: ${rewardVaultPDA.toBase58()}\n`);

  // Check if already initialized
  const existing = await connection.getAccountInfo(configPDA);
  if (existing) {
    console.log("Config already exists — skipping initialization.\n");
  } else {
    console.log("Calling initialize(reward_rate=100)...");
    const rewardRate = new anchor.BN(100);

    const sig = await program.methods
      .initialize(rewardRate)
      .accounts({
        admin: admin.publicKey,
        config: configPDA,
        mint: hogeMint,
        vault: vaultPDA,
        rewardVault: rewardVaultPDA,
        token2022Program: TOKEN_2022_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log(`  TX: ${sig}`);
    console.log(`  Explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet\n`);
  }

  // Save hibernate-info.json
  const hibernateInfo = {
    program: HIBERNATE_PROGRAM_ID.toBase58(),
    config: configPDA.toBase58(),
    vault: vaultPDA.toBase58(),
    rewardVault: rewardVaultPDA.toBase58(),
    mint: hogeMint.toBase58(),
    rewardRate: 100,
    network: "devnet",
    createdAt: new Date().toISOString(),
  };
  const outPath = path.resolve(__dirname, "../hibernate-info.json");
  fs.writeFileSync(outPath, JSON.stringify(hibernateInfo, null, 2));
  console.log(`Saved: ${outPath}`);

  console.log("\n================================");
  console.log("HIBERNATION PORTAL INITIALIZED");
  console.log("================================\n");
  console.log(`Program:      ${HIBERNATE_PROGRAM_ID.toBase58()}`);
  console.log(`Config:       ${configPDA.toBase58()}`);
  console.log(`Vault:        ${vaultPDA.toBase58()}`);
  console.log(`Reward Vault: ${rewardVaultPDA.toBase58()}`);
  console.log(`Reward Rate:  100 raw/sec`);
}

main().catch((err) => {
  console.error("\nFATAL ERROR:", err);
  process.exit(1);
});
