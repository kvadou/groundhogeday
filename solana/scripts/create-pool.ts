/**
 * Groundhoge Day — Create Raydium CPMM Pool ($HOGE/SOL)
 *
 * Creates a devnet liquidity pool pairing $HOGE with wrapped SOL.
 * Uses Raydium SDK V2 with CPMM (supports Token-2022).
 *
 * Usage:
 *   npx ts-node scripts/create-pool.ts
 */

import {
  Raydium,
  TxVersion,
  parseTokenAccountResp,
  DEV_API_URLS,
  DEVNET_PROGRAM_ID,
  getCpmmPdaAmmConfigId,
} from "@raydium-io/raydium-sdk-v2";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  NATIVE_MINT,
} from "@solana/spl-token";
import BN from "bn.js";
import * as fs from "fs";
import * as path from "path";

// ── Config ─────────────────────────────────────────────────────────────

const DEVNET_URL = "https://api.devnet.solana.com";
const DECIMALS = 2;

// How much $HOGE + SOL to seed the pool with
const HOGE_SEED_AMOUNT = 10_000_000; // 10M $HOGE (raw: 10M * 100 = 1B raw units)
const SOL_SEED_AMOUNT = 1; // 1 SOL (raw: 1e9 lamports)

// ── Helpers ────────────────────────────────────────────────────────────

function loadKeypair(filepath: string): Keypair {
  const raw = fs.readFileSync(filepath, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

function loadMintInfo(): any {
  const p = path.resolve(__dirname, "../mint-info.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log("🦫 GROUNDHOGE DAY — Create Raydium CPMM Pool ($HOGE/SOL)");
  console.log("==========================================================\n");

  const mintInfo = loadMintInfo();
  const hogeMint = mintInfo.mint;

  const owner = loadKeypair(
    path.resolve(process.env.HOME || "~", ".config/solana/groundhoge-dev.json")
  );
  const connection = new Connection(DEVNET_URL, "confirmed");

  console.log(`Owner: ${owner.publicKey.toBase58()}`);
  console.log(`$HOGE Mint: ${hogeMint}`);

  const balance = await connection.getBalance(owner.publicKey);
  console.log(`Balance: ${balance / 1e9} SOL\n`);

  // ── Init Raydium SDK ─────────────────────────────────────────────

  console.log("Initializing Raydium SDK (devnet)...");

  const raydium = await Raydium.load({
    owner,
    connection,
    cluster: "devnet",
    disableFeatureCheck: true,
    disableLoadToken: false,
    blockhashCommitment: "finalized",
    urlConfigs: {
      ...DEV_API_URLS,
      BASE_HOST: "https://api-v3-devnet.raydium.io",
      OWNER_BASE_HOST: "https://owner-v1-devnet.raydium.io",
      SWAP_HOST: "https://transaction-v1-devnet.raydium.io",
      CPMM_LOCK:
        "https://dynamic-ipfs-devnet.raydium.io/lock/cpmm/position",
    },
  });
  console.log("  SDK loaded.\n");

  // ── Fetch fee configs ────────────────────────────────────────────

  console.log("Fetching CPMM fee configs...");
  const feeConfigs = await raydium.api.getCpmmConfigs();

  // Remap IDs to devnet program
  feeConfigs.forEach((config) => {
    config.id = getCpmmPdaAmmConfigId(
      DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
      config.index
    ).publicKey.toBase58();
  });

  console.log(
    `  Found ${feeConfigs.length} fee tiers. Using tier 0 (${feeConfigs[0].tradeFeeRate}bps trade fee).\n`
  );

  // ── Create Pool ──────────────────────────────────────────────────

  console.log("Creating CPMM pool...");
  console.log(
    `  Seeding: ${HOGE_SEED_AMOUNT.toLocaleString()} $HOGE + ${SOL_SEED_AMOUNT} SOL`
  );

  // $HOGE is Token-2022, SOL is regular Token Program
  const mintA = {
    address: hogeMint,
    programId: TOKEN_2022_PROGRAM_ID.toBase58(),
    decimals: DECIMALS,
  };
  const mintB = {
    address: NATIVE_MINT.toBase58(),
    programId: TOKEN_PROGRAM_ID.toBase58(),
    decimals: 9,
  };

  const hogeRawAmount = new BN(HOGE_SEED_AMOUNT).mul(
    new BN(10).pow(new BN(DECIMALS))
  );
  const solRawAmount = new BN(SOL_SEED_AMOUNT).mul(new BN(10).pow(new BN(9)));

  const { execute, extInfo } = await raydium.cpmm.createPool({
    programId: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
    poolFeeAccount: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC,
    mintA,
    mintB,
    mintAAmount: hogeRawAmount,
    mintBAmount: solRawAmount,
    startTime: new BN(0),
    feeConfig: feeConfigs[0],
    associatedOnly: false,
    ownerInfo: {
      useSOLBalance: true,
    },
    txVersion: TxVersion.V0,
  });

  console.log("  Pool transaction built. Sending...");

  const { txId } = await execute({ sendAndConfirm: true });
  console.log(`  TX: ${txId}`);

  const poolKeys = Object.keys(extInfo.address).reduce(
    (acc, cur) => ({
      ...acc,
      [cur]: extInfo.address[cur as keyof typeof extInfo.address].toString(),
    }),
    {} as Record<string, string>
  );

  console.log("\n==========================================================");
  console.log("POOL CREATED SUCCESSFULLY!");
  console.log("==========================================================\n");
  console.log("Pool Keys:");
  Object.entries(poolKeys).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}`);
  });

  // Save pool info
  const poolInfo = {
    ...poolKeys,
    txId,
    hogeMint,
    solMint: NATIVE_MINT.toBase58(),
    hogeSeeded: HOGE_SEED_AMOUNT,
    solSeeded: SOL_SEED_AMOUNT,
    network: "devnet",
    createdAt: new Date().toISOString(),
  };
  const outPath = path.resolve(__dirname, "../pool-info.json");
  fs.writeFileSync(outPath, JSON.stringify(poolInfo, null, 2));
  console.log(`\nPool info saved to: ${outPath}`);
}

main().catch((err) => {
  console.error("\nFATAL ERROR:", err);
  process.exit(1);
});
