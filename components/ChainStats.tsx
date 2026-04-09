"use client";

import { useChainStats } from "@/hooks/useChainStats";
import { useWallet } from "@solana/wallet-adapter-react";
import { useInView } from "@/hooks/useInView";
import { formatHoge, formatSol, HOGE_MINT, GLOBAL_COUNTER_PDA, VAULT_HOGE, VAULT_WSOL } from "@/lib/solana";

function StatBox({
  label,
  value,
  href,
  color = "#ffaa00",
}: {
  label: string;
  value: string;
  href?: string;
  color?: string;
}) {
  const inner = (
    <div
      className="border border-[#1a1a2e] rounded p-6 hover:border-[#ffaa00]/30 transition-colors"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="text-xs text-[#666666] uppercase tracking-widest mb-2">
        {label}
      </div>
      <div className="text-lg" style={{ color, textShadow: `0 0 10px ${color}33` }}>
        {value}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

export default function ChainStats() {
  const stats = useChainStats();
  const { connected } = useWallet();
  const [ref, isInView] = useInView();

  const mono = { fontFamily: "var(--font-mono)" };
  const explorerBase = "https://explorer.solana.com";
  const cluster = "?cluster=devnet";

  return (
    <section
      ref={ref}
      className={`py-24 max-w-6xl mx-auto px-6 fade-in-section ${isInView ? "is-visible" : ""}`}
    >
      <h2
        className="text-center tracking-[0.3em] text-sm text-[#666666] uppercase"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        ON-CHAIN INTELLIGENCE
      </h2>
      <p
        className="text-center text-xs text-[#666666] mt-2"
        style={mono}
      >
        LIVE FROM SOLANA DEVNET &middot; REFRESHES EVERY 15s
      </p>

      {stats.loading ? (
        <div className="mt-12 text-center text-xs text-[#666666]" style={mono}>
          CONNECTING TO THE ORACLE...
        </div>
      ) : (
        <>
          {/* Main stats grid */}
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <StatBox
              label="Total $HOGE Supply"
              value={stats.totalSupply !== null ? formatHoge(stats.totalSupply) : "—"}
              href={`${explorerBase}/address/${HOGE_MINT.toBase58()}${cluster}`}
            />
            <StatBox
              label="Global Transactions"
              value={stats.globalTxCount !== null ? stats.globalTxCount.toLocaleString() : "—"}
              href={`${explorerBase}/address/${GLOBAL_COUNTER_PDA.toBase58()}${cluster}`}
              color="#00ff88"
            />
            <StatBox
              label="Last Trap (109th TX)"
              value={
                stats.lastTrappedTx
                  ? `TX #${stats.lastTrappedTx.toLocaleString()}`
                  : "NONE YET"
              }
              color="#ff4444"
            />
          </div>

          {/* Burrow reserves */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <StatBox
              label="Burrow Vault — $HOGE"
              value={
                stats.vaultHogeBalance !== null
                  ? `${formatHoge(stats.vaultHogeBalance)} $HOGE`
                  : "—"
              }
              href={`${explorerBase}/address/${VAULT_HOGE.toBase58()}${cluster}`}
              color="#ffaa00"
            />
            <StatBox
              label="Burrow Vault — SOL"
              value={
                stats.vaultSolBalance !== null
                  ? `${formatSol(stats.vaultSolBalance)} SOL`
                  : "—"
              }
              href={`${explorerBase}/address/${VAULT_WSOL.toBase58()}${cluster}`}
              color="#00ff88"
            />
          </div>

          {/* Wallet-specific stats */}
          {connected && (
            <div className="mt-4">
              <StatBox
                label="Your Daily Transfer Allowance"
                value={
                  stats.walletDailyUsed !== null
                    ? `${formatHoge(stats.walletDailyUsed)} / ${formatHoge(stats.walletDailyLimit)} $HOGE`
                    : "WALLET NOT REGISTERED"
                }
                color={
                  stats.walletDailyUsed !== null &&
                  stats.walletDailyUsed > stats.walletDailyLimit * 0.8
                    ? "#ff4444"
                    : "#00ff88"
                }
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}
