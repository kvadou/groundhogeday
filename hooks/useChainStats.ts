"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import {
  HOGE_MINT,
  GLOBAL_COUNTER_PDA,
  VAULT_HOGE,
  VAULT_WSOL,
  HOOK_PROGRAM_ID,
  DAILY_COUNTER_SEED,
} from "@/lib/solana";

const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

export interface ChainStats {
  totalSupply: bigint | null;
  globalTxCount: number | null;
  lastTrappedTx: number | null;
  vaultHogeBalance: bigint | null;
  vaultSolBalance: number | null;
  walletDailyUsed: number | null;
  walletDailyLimit: number;
  loading: boolean;
}

const DAILY_LIMIT_RAW = 188_300;

/** Read a little-endian u64 from a Uint8Array (works in browser, no Buffer needed) */
function readU64LE(data: Uint8Array | Buffer, offset: number): number {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return Number(view.getBigUint64(offset, true));
}

export function useChainStats(): ChainStats {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [stats, setStats] = useState<ChainStats>({
    totalSupply: null,
    globalTxCount: null,
    lastTrappedTx: null,
    vaultHogeBalance: null,
    vaultSolBalance: null,
    walletDailyUsed: null,
    walletDailyLimit: DAILY_LIMIT_RAW,
    loading: true,
  });

  const fetchStats = useCallback(async () => {
    try {
      // Fetch all data in parallel
      const [mintData, globalCounterData, vaultHogeData, vaultSolData] =
        await Promise.all([
          getMint(connection, HOGE_MINT, "confirmed", TOKEN_2022_PROGRAM_ID),
          connection.getAccountInfo(GLOBAL_COUNTER_PDA),
          connection.getAccountInfo(VAULT_HOGE),
          connection.getBalance(VAULT_WSOL),
        ]);

      let globalTxCount: number | null = null;
      let lastTrappedTx: number | null = null;

      if (globalCounterData && globalCounterData.data.length >= 24) {
        // Skip 8-byte Anchor discriminator
        globalTxCount = readU64LE(globalCounterData.data, 8);
        lastTrappedTx = readU64LE(globalCounterData.data, 16);
      }

      // Parse HOGE vault balance from Token-2022 account data
      let vaultHogeBalance: bigint | null = null;
      if (vaultHogeData && vaultHogeData.data.length >= 72) {
        // Token account layout: amount at offset 64 (8 bytes LE)
        vaultHogeBalance = BigInt(readU64LE(vaultHogeData.data, 64));
      }

      // Fetch wallet daily counter if connected
      let walletDailyUsed: number | null = null;
      if (publicKey) {
        const [dailyPda] = PublicKey.findProgramAddressSync(
          [DAILY_COUNTER_SEED, publicKey.toBuffer()],
          HOOK_PROGRAM_ID
        );
        const dailyData = await connection.getAccountInfo(dailyPda);
        if (dailyData && dailyData.data.length >= 24) {
          walletDailyUsed = readU64LE(dailyData.data, 16);
        }
      }

      setStats({
        totalSupply: mintData.supply,
        globalTxCount,
        lastTrappedTx,
        vaultHogeBalance,
        vaultSolBalance: vaultSolData,
        walletDailyUsed,
        walletDailyLimit: DAILY_LIMIT_RAW,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch chain stats:", err);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15_000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [fetchStats]);

  return stats;
}
