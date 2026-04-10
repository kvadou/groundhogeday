/**
 * Fund the Hibernation Portal reward vault with $HOGE
 *
 * CRITICAL: $HOGE is Token-2022 with a TransferHook. We must pass the hook's
 * extra accounts as remaining_accounts on the fund_rewards instruction.
 */

import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  addExtraAccountMetasForExecute,
  createTransferCheckedInstruction,
  getAccount,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";

const DEVNET_URL = "https://api.devnet.solana.com";
const HIBERNATE_PROGRAM_ID = new PublicKey("8udHGYeRaqNHAMeK3Br66q4mciViz8dL3D4rtPpUXD6q");
const HOOK_PROGRAM_ID = new PublicKey("BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU");

// Amount to fund: 1,000,000 raw = 10,000 $HOGE (2 decimals)
// If daily limit hits, try AMOUNT = 100_000 (1,000 $HOGE)
const AMOUNT = 100_000;

function loadKeypair(filepath: string): Keypair {
  const raw = fs.readFileSync(filepath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

async function main() {
  console.log("HIBERNATION PORTAL — Fund Rewards");
  console.log("===================================\n");

  const connection = new Connection(DEVNET_URL, "confirmed");
  const admin = loadKeypair(
    path.resolve(process.env.HOME || "~", ".config/solana/groundhoge-dev.json")
  );

  // Load hibernate info
  const hibernateInfo = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../hibernate-info.json"), "utf-8")
  );
  const mintInfo = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../mint-info.json"), "utf-8")
  );

  const hogeMint = new PublicKey(hibernateInfo.mint);
  const configPDA = new PublicKey(hibernateInfo.config);
  const rewardVaultPDA = new PublicKey(hibernateInfo.rewardVault);

  console.log(`Admin:        ${admin.publicKey.toBase58()}`);
  console.log(`Reward Vault: ${rewardVaultPDA.toBase58()}`);
  console.log(`Amount:       ${AMOUNT} raw (${AMOUNT / 100} $HOGE)\n`);

  // Admin's $HOGE ATA (Token-2022)
  const adminHoge = getAssociatedTokenAddressSync(
    hogeMint, admin.publicKey, false,
    TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
  );
  console.log(`Admin ATA:    ${adminHoge.toBase58()}`);

  // Check admin balance
  const adminAccount = await getAccount(connection, adminHoge, "confirmed", TOKEN_2022_PROGRAM_ID);
  console.log(`Admin $HOGE:  ${Number(adminAccount.amount) / 100}\n`);

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

  // Resolve TransferHook extra accounts using a dummy transferChecked instruction
  // The fund_rewards instruction does a CPI transfer from admin_hoge -> reward_vault,
  // which triggers the hook. We need to pass hook accounts as remaining_accounts.
  console.log("Resolving TransferHook extra accounts...");

  const dummyTransferIx = createTransferCheckedInstruction(
    adminHoge, hogeMint, rewardVaultPDA, admin.publicKey,
    AMOUNT, 2, [], TOKEN_2022_PROGRAM_ID
  );

  await addExtraAccountMetasForExecute(
    connection, dummyTransferIx, HOOK_PROGRAM_ID,
    adminHoge, hogeMint, rewardVaultPDA, admin.publicKey,
    AMOUNT, "confirmed"
  );

  // Extract extra accounts (skip the first 4 standard TransferChecked accounts)
  const extraAccountMetas = dummyTransferIx.keys.slice(4).map((k) => ({
    pubkey: k.pubkey,
    isSigner: false,
    isWritable: k.isWritable,
  }));

  console.log("Extra hook accounts:");
  extraAccountMetas.forEach((k, i) => {
    console.log(`  [${i}] ${k.pubkey.toBase58()} writable=${k.isWritable}`);
  });
  console.log();

  // Call fund_rewards with remaining accounts for the hook
  console.log(`Calling fund_rewards(${AMOUNT})...`);
  try {
    const sig = await program.methods
      .fundRewards(new anchor.BN(AMOUNT))
      .accounts({
        admin: admin.publicKey,
        config: configPDA,
        mint: hogeMint,
        rewardVault: rewardVaultPDA,
        adminHoge: adminHoge,
        token2022Program: TOKEN_2022_PROGRAM_ID,
      })
      .remainingAccounts(extraAccountMetas)
      .rpc();

    console.log(`\n  TX: ${sig}`);
    console.log(`  Explorer: https://explorer.solana.com/tx/${sig}?cluster=devnet\n`);
  } catch (err: any) {
    console.error("\nFUND FAILED:");
    if (err.transactionLogs) {
      err.transactionLogs.forEach((log: string) => console.error("  ", log));
    } else {
      console.error("  ", err.message);
    }
    process.exit(1);
  }

  // Check reward vault balance
  try {
    const vaultAccount = await getAccount(
      connection, rewardVaultPDA, "confirmed", TOKEN_2022_PROGRAM_ID
    );
    console.log(`Reward vault balance: ${Number(vaultAccount.amount) / 100} $HOGE`);
  } catch {
    console.log("Could not read reward vault balance (may be a PDA token account).");
  }

  console.log("\n===================================");
  console.log("REWARD VAULT FUNDED");
  console.log("===================================");
}

main().catch((err) => {
  console.error("\nFATAL ERROR:", err);
  process.exit(1);
});
