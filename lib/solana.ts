import { PublicKey } from "@solana/web3.js";

export const DEVNET_URL = "https://api.devnet.solana.com";

// Token
export const HOGE_MINT = new PublicKey("Cn1WQsxcExJFEcgJAXns3CL34CNjovJ4RXp3APzUQ7ZQ");
export const HOGE_DECIMALS = 2;

// Programs
export const HOOK_PROGRAM_ID = new PublicKey("BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU");
export const BURROW_PROGRAM_ID = new PublicKey("4TJmU197oWhxmjSq5LR8fSvcgy3i6drXhP5zhNzKi9zi");

// PDAs
export const GLOBAL_COUNTER_PDA = new PublicKey("EM54My6d8cdtjDfmeqjCsNq4hv1YdgeJCX8XAYy6ibcY");
export const HOOK_CONFIG_PDA = new PublicKey("DXJWaQwbQbTLzxS4i4DBVr3W4xJt8L5bYjSARhh891vN");

// Hibernate program
export const HIBERNATE_PROGRAM_ID = new PublicKey("8udHGYeRaqNHAMeK3Br66q4mciViz8dL3D4rtPpUXD6q");

// Pool (The Burrow)
export const POOL_PDA = new PublicKey("4oC28QeV6G2qh6hFTEwLrwpuY1XkK74VGGQbnp5QMJpq");
export const VAULT_HOGE = new PublicKey("CrPko9yCEcTnw3gp5KF8zrzpTQpWmS6BbczaTkxK83Sk");
export const VAULT_WSOL = new PublicKey("Ey4x4ASsSx2NBsRAq2cHEY934BLmcpw2EXKfuoveJApn");

// Seeds
export const DAILY_COUNTER_SEED = Buffer.from("daily-limit");

/** Format raw token amount with decimals */
export function formatHoge(rawAmount: bigint | number): string {
  const num = Number(rawAmount) / 10 ** HOGE_DECIMALS;
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** Format SOL from lamports */
export function formatSol(lamports: bigint | number): string {
  const num = Number(lamports) / 1e9;
  return num.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
