import {
  Connection, PublicKey, Transaction, SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync, ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  addExtraAccountMetasForExecute,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import {
  HOGE_MINT, HOGE_DECIMALS, HOOK_PROGRAM_ID, HIBERNATE_PROGRAM_ID,
} from "./solana";

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

export type HibernateTier = "LightSleep" | "DeepSleep" | "TrueHibernation" | "Permafrost";

export const TIER_INFO: Record<HibernateTier, { label: string; days: number; multiplier: number; color: string }> = {
  LightSleep: { label: "Light Sleep", days: 7, multiplier: 1, color: "#4488ff" },
  DeepSleep: { label: "Deep Sleep", days: 30, multiplier: 2, color: "#00ff88" },
  TrueHibernation: { label: "True Hibernation", days: 90, multiplier: 5, color: "#ffaa00" },
  Permafrost: { label: "Permafrost", days: 365, multiplier: 10, color: "#00ddff" },
};

export interface StakePositionData {
  owner: string;
  amount: number;
  amountRaw: number;
  tier: HibernateTier;
  multiplier: number;
  weightedAmount: number;
  lockStart: number;
  lockEnd: number;
  rewardDebt: number;
  isLocked: boolean;
  timeRemaining: number;
}

export interface HibernateConfigData {
  totalStaked: number;
  totalStakedRaw: number;
  totalWeighted: number;
  rewardRate: number;
  lastUpdateTs: number;
  accumulatedPerWeight: number;
}

// ---------------------------------------------------------------------------
// PDA Seeds
// ---------------------------------------------------------------------------

const CONFIG_SEED = Buffer.from("hibernate-config");
const VAULT_SEED = Buffer.from("hibernate-vault");
const REWARD_VAULT_SEED = Buffer.from("hibernate-rewards");
const STAKE_SEED = Buffer.from("stake");

// ---------------------------------------------------------------------------
// PDA Derivation
// ---------------------------------------------------------------------------

export function getConfigPDA(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([CONFIG_SEED], HIBERNATE_PROGRAM_ID);
  return pda;
}

export function getVaultPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([VAULT_SEED, mint.toBuffer()], HIBERNATE_PROGRAM_ID);
  return pda;
}

export function getRewardVaultPDA(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([REWARD_VAULT_SEED, mint.toBuffer()], HIBERNATE_PROGRAM_ID);
  return pda;
}

export function getStakePositionPDA(user: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([STAKE_SEED, user.toBuffer()], HIBERNATE_PROGRAM_ID);
  return pda;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a HibernateTier string to the Anchor enum format */
function tierToAnchorEnum(tier: HibernateTier): Record<string, Record<string, never>> {
  const map: Record<HibernateTier, string> = {
    LightSleep: "lightSleep",
    DeepSleep: "deepSleep",
    TrueHibernation: "trueHibernation",
    Permafrost: "permafrost",
  };
  return { [map[tier]]: {} };
}

/** Parse an Anchor enum variant back into our HibernateTier type */
function parseTierEnum(raw: Record<string, unknown>): HibernateTier {
  if ("lightSleep" in raw) return "LightSleep";
  if ("deepSleep" in raw) return "DeepSleep";
  if ("trueHibernation" in raw) return "TrueHibernation";
  if ("permafrost" in raw) return "Permafrost";
  throw new Error("Unknown tier variant");
}

/** Load the IDL and return an Anchor Program instance (read-only provider) */
async function getProgram(connection: Connection, user?: PublicKey) {
  const res = await fetch("/idl/groundhoge_hibernate.json");
  const idl = await res.json();

  const wallet = user
    ? {
        publicKey: user,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      } as anchor.Wallet
    : {
        publicKey: PublicKey.default,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      } as anchor.Wallet;

  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  return new anchor.Program(idl, provider);
}

/** Resolve transfer hook extra accounts for a HOGE transfer */
async function getHookExtraAccounts(
  connection: Connection,
  source: PublicKey,
  destination: PublicKey,
  authority: PublicKey,
): Promise<{ pubkey: PublicKey; isSigner: boolean; isWritable: boolean }[]> {
  const dummyIx = createTransferCheckedInstruction(
    source, HOGE_MINT, destination, authority, 1, HOGE_DECIMALS, [],
    TOKEN_2022_PROGRAM_ID,
  );
  await addExtraAccountMetasForExecute(
    connection, dummyIx, HOOK_PROGRAM_ID,
    source, HOGE_MINT, destination, authority, 1, "confirmed",
  );
  return dummyIx.keys.slice(4).map(k => ({
    pubkey: k.pubkey,
    isSigner: false,
    isWritable: k.isWritable,
  }));
}

// ---------------------------------------------------------------------------
// Transaction Builders
// ---------------------------------------------------------------------------

export async function buildStakeTransaction(
  connection: Connection,
  user: PublicKey,
  tier: HibernateTier,
  amount: number,
): Promise<Transaction> {
  const program = await getProgram(connection, user);
  const amountRaw = Math.floor(amount * 10 ** HOGE_DECIMALS);

  const userHoge = getAssociatedTokenAddressSync(
    HOGE_MINT, user, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const vault = getVaultPDA(HOGE_MINT);

  // Resolve transfer hook extras (user -> vault)
  const hookExtras = await getHookExtraAccounts(connection, userHoge, vault, user);

  const ix = await program.methods
    .stake(tierToAnchorEnum(tier), new anchor.BN(amountRaw))
    .accounts({
      user,
      config: getConfigPDA(),
      position: getStakePositionPDA(user),
      mint: HOGE_MINT,
      vault,
      userHoge,
      token2022Program: TOKEN_2022_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(hookExtras)
    .instruction();

  const tx = new Transaction();
  tx.add(ix);
  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  return tx;
}

export async function buildClaimTransaction(
  connection: Connection,
  user: PublicKey,
): Promise<Transaction> {
  const program = await getProgram(connection, user);

  const userHoge = getAssociatedTokenAddressSync(
    HOGE_MINT, user, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const rewardVault = getRewardVaultPDA(HOGE_MINT);

  // Resolve transfer hook extras (reward_vault -> user)
  const configPDA = getConfigPDA();
  const hookExtras = await getHookExtraAccounts(connection, rewardVault, userHoge, configPDA);

  const tx = new Transaction();

  // Ensure user has a HOGE ATA
  const hogeInfo = await connection.getAccountInfo(userHoge);
  if (!hogeInfo) {
    tx.add(createAssociatedTokenAccountInstruction(
      user, userHoge, user, HOGE_MINT,
      TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
    ));
  }

  const ix = await program.methods
    .claim()
    .accounts({
      user,
      config: configPDA,
      position: getStakePositionPDA(user),
      mint: HOGE_MINT,
      rewardVault,
      userHoge,
      token2022Program: TOKEN_2022_PROGRAM_ID,
    })
    .remainingAccounts(hookExtras)
    .instruction();

  tx.add(ix);
  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  return tx;
}

export async function buildUnstakeTransaction(
  connection: Connection,
  user: PublicKey,
): Promise<Transaction> {
  const program = await getProgram(connection, user);

  const userHoge = getAssociatedTokenAddressSync(
    HOGE_MINT, user, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const vault = getVaultPDA(HOGE_MINT);
  const rewardVault = getRewardVaultPDA(HOGE_MINT);
  const configPDA = getConfigPDA();

  // Resolve transfer hook extras for vault -> user (unstake principal)
  const hookExtras = await getHookExtraAccounts(connection, vault, userHoge, configPDA);

  const tx = new Transaction();

  // Ensure user has a HOGE ATA
  const hogeInfo = await connection.getAccountInfo(userHoge);
  if (!hogeInfo) {
    tx.add(createAssociatedTokenAccountInstruction(
      user, userHoge, user, HOGE_MINT,
      TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
    ));
  }

  const ix = await program.methods
    .unstake()
    .accounts({
      user,
      config: configPDA,
      position: getStakePositionPDA(user),
      mint: HOGE_MINT,
      vault,
      rewardVault,
      userHoge,
      token2022Program: TOKEN_2022_PROGRAM_ID,
    })
    .remainingAccounts(hookExtras)
    .instruction();

  tx.add(ix);
  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  return tx;
}

// ---------------------------------------------------------------------------
// Data Fetchers
// ---------------------------------------------------------------------------

export async function fetchStakePosition(
  connection: Connection,
  user: PublicKey,
): Promise<StakePositionData | null> {
  const program = await getProgram(connection);
  const positionPDA = getStakePositionPDA(user);

  const raw = await (program.account as any).stakePosition.fetchNullable(positionPDA);
  if (!raw) return null;

  const now = Math.floor(Date.now() / 1000);
  const lockEnd = Number(raw.lockEnd);
  const amountRaw = Number(raw.amount);
  const tier = parseTierEnum(raw.tier);

  return {
    owner: raw.owner.toBase58(),
    amount: amountRaw / 10 ** HOGE_DECIMALS,
    amountRaw,
    tier,
    multiplier: raw.multiplier,
    weightedAmount: Number(raw.weightedAmount),
    lockStart: Number(raw.lockStart),
    lockEnd,
    rewardDebt: Number(raw.rewardDebt),
    isLocked: now < lockEnd,
    timeRemaining: Math.max(0, lockEnd - now),
  };
}

export async function fetchHibernateConfig(
  connection: Connection,
): Promise<HibernateConfigData | null> {
  const program = await getProgram(connection);
  const configPDA = getConfigPDA();

  try {
    const raw = await (program.account as any).hibernateConfig.fetch(configPDA);
    return {
      totalStaked: Number(raw.totalStaked) / 10 ** HOGE_DECIMALS,
      totalStakedRaw: Number(raw.totalStaked),
      totalWeighted: Number(raw.totalWeighted),
      rewardRate: Number(raw.rewardRate),
      lastUpdateTs: Number(raw.lastUpdateTs),
      accumulatedPerWeight: Number(raw.accumulatedPerWeight),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Reward Estimation (client-side MasterChef math)
// ---------------------------------------------------------------------------

const ACC_PRECISION = 1e12; // matches on-chain PRECISION constant

export function estimatePendingRewards(
  position: StakePositionData,
  config: HibernateConfigData,
): number {
  if (config.totalWeighted === 0 || position.weightedAmount === 0) return 0;

  const now = Math.floor(Date.now() / 1000);
  const elapsed = Math.max(0, now - config.lastUpdateTs);

  // Update accumulated rewards per weighted token
  const newRewards = elapsed * config.rewardRate;
  const accPerWeight = config.accumulatedPerWeight + (newRewards * ACC_PRECISION) / config.totalWeighted;

  // Calculate pending for this position
  const pending = (position.weightedAmount * accPerWeight) / ACC_PRECISION - position.rewardDebt;

  return Math.max(0, pending) / 10 ** HOGE_DECIMALS;
}
