/**
 * Groundhoge Day — Hibernate End-to-End Test
 *
 * Tests: stake → wait → claim → check state
 * Run: npx tsx scripts/test-hibernate.ts
 */

import {
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  addExtraAccountMetasForExecute,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

const DEVNET_URL = "https://api.devnet.solana.com";
const DECIMALS = 2;

function loadKeypair(filepath: string): Keypair {
  const raw = fs.readFileSync(filepath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

async function main() {
  console.log("🦫 HIBERNATION PORTAL — End-to-End Test");
  console.log("========================================\n");

  const connection = new Connection(DEVNET_URL, "confirmed");
  const admin = loadKeypair(
    path.resolve(process.env.HOME || "~", ".config/solana/groundhoge-dev.json")
  );

  // Load program
  const idlPath = path.resolve(__dirname, "../target/idl/groundhoge_hibernate.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(admin), {
    commitment: "confirmed",
  });
  const program = new anchor.Program(idl, provider);

  // Load addresses
  const hibernateInfo = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../hibernate-info.json"), "utf-8")
  );
  const mintInfo = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../mint-info.json"), "utf-8")
  );

  const mint = new PublicKey(mintInfo.mint);
  const hookProgram = new PublicKey(mintInfo.hookProgram);
  const configPDA = new PublicKey(hibernateInfo.config);
  const vaultPDA = new PublicKey(hibernateInfo.vault);
  const rewardVaultPDA = new PublicKey(hibernateInfo.rewardVault);

  const [stakePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), admin.publicKey.toBuffer()],
    program.programId
  );

  const adminATA = getAssociatedTokenAddressSync(
    mint, admin.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // ── Check Config ──────────────────────────────────────────────────

  console.log("1. Checking config...");
  const config = await program.account.hibernateConfig.fetch(configPDA);
  console.log(`   Total staked: ${Number(config.totalStaked) / 100}`);
  console.log(`   Total weighted: ${Number(config.totalWeighted)}`);
  console.log(`   Reward rate: ${Number(config.rewardRate)} raw/sec`);
  console.log(`   Reward vault: ${hibernateInfo.rewardVault}`);

  // Check reward vault balance
  const rewardAccount = await getAccount(connection, rewardVaultPDA, "confirmed", TOKEN_2022_PROGRAM_ID);
  console.log(`   Reward vault balance: ${Number(rewardAccount.amount) / 100} $HOGE\n`);

  // ── Check for existing position ───────────────────────────────────

  console.log("2. Checking for existing stake position...");
  let existingPosition = null;
  try {
    existingPosition = await program.account.stakePosition.fetch(stakePDA);
    console.log(`   Found existing position: ${Number(existingPosition.amount) / 100} $HOGE`);
    console.log(`   Tier: ${JSON.stringify(existingPosition.tier)}`);
    console.log(`   Lock end: ${new Date(Number(existingPosition.lockEnd) * 1000).toISOString()}`);
  } catch {
    console.log("   No existing position — will stake.\n");
  }

  if (existingPosition) {
    console.log("\n   Position already exists. Skipping stake test.");
    console.log("   To re-test, unstake first (after lock expires).\n");

    // Try claiming
    console.log("3. Attempting claim...");
    try {
      const claimSig = await program.methods
        .claim()
        .accounts({
          user: admin.publicKey,
          config: configPDA,
          position: stakePDA,
          mint,
          rewardVault: rewardVaultPDA,
          userHoge: adminATA,
          token2022Program: TOKEN_2022_PROGRAM_ID,
        })
        .rpc();
      console.log(`   Claimed! TX: ${claimSig}\n`);
    } catch (err: any) {
      console.log(`   Claim failed (expected if no rewards): ${err.message}\n`);
    }

    return;
  }

  // ── Stake ─────────────────────────────────────────────────────────

  console.log("3. Staking 100 $HOGE as LightSleep...");

  const stakeAmount = 100 * (10 ** DECIMALS); // 10000 raw

  // Resolve TransferHook extra accounts
  const stakeInstruction = await program.methods
    .stake({ lightSleep: {} }, new anchor.BN(stakeAmount))
    .accounts({
      user: admin.publicKey,
      config: configPDA,
      position: stakePDA,
      mint,
      vault: vaultPDA,
      userHoge: adminATA,
      token2022Program: TOKEN_2022_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();

  // Add hook extra accounts
  await addExtraAccountMetasForExecute(
    connection,
    stakeInstruction,
    hookProgram,
    adminATA,
    mint,
    vaultPDA,
    admin.publicKey,
    stakeAmount,
    "confirmed"
  );

  const stakeTx = new anchor.web3.Transaction().add(stakeInstruction);
  const stakeSig = await anchor.web3.sendAndConfirmTransaction(connection, stakeTx, [admin]);
  console.log(`   TX: ${stakeSig}`);
  console.log(`   Explorer: https://explorer.solana.com/tx/${stakeSig}?cluster=devnet`);

  // Verify position
  const position = await program.account.stakePosition.fetch(stakePDA);
  console.log(`   Position created!`);
  console.log(`   Amount: ${Number(position.amount) / 100} $HOGE`);
  console.log(`   Tier: ${JSON.stringify(position.tier)}`);
  console.log(`   Multiplier: ${position.multiplier}x`);
  console.log(`   Lock end: ${new Date(Number(position.lockEnd) * 1000).toISOString()}\n`);

  // ── Wait + Claim ──────────────────────────────────────────────────

  console.log("4. Waiting 5 seconds for rewards to accrue...");
  await new Promise((r) => setTimeout(r, 5000));

  console.log("5. Claiming rewards...");
  try {
    const claimSig = await program.methods
      .claim()
      .accounts({
        user: admin.publicKey,
        config: configPDA,
        position: stakePDA,
        mint,
        rewardVault: rewardVaultPDA,
        userHoge: adminATA,
        token2022Program: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();
    console.log(`   Claimed! TX: ${claimSig}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${claimSig}?cluster=devnet\n`);
  } catch (err: any) {
    console.log(`   Claim result: ${err.message}\n`);
  }

  // ── Final State ───────────────────────────────────────────────────

  console.log("6. Final state:");
  const finalConfig = await program.account.hibernateConfig.fetch(configPDA);
  console.log(`   Total staked: ${Number(finalConfig.totalStaked) / 100} $HOGE`);
  console.log(`   Total weighted: ${Number(finalConfig.totalWeighted)}`);

  const adminBalance = await getAccount(connection, adminATA, "confirmed", TOKEN_2022_PROGRAM_ID);
  console.log(`   Admin balance: ${Number(adminBalance.amount) / 100} $HOGE`);

  const vaultBalance = await getAccount(connection, vaultPDA, "confirmed", TOKEN_2022_PROGRAM_ID);
  console.log(`   Vault balance: ${Number(vaultBalance.amount) / 100} $HOGE`);

  const rewardBalance = await getAccount(connection, rewardVaultPDA, "confirmed", TOKEN_2022_PROGRAM_ID);
  console.log(`   Reward vault: ${Number(rewardBalance.amount) / 100} $HOGE`);

  console.log("\n========================================");
  console.log("TEST COMPLETE!");
  console.log("========================================");
}

main().catch((err) => {
  console.error("\nFATAL ERROR:", err);
  process.exit(1);
});
