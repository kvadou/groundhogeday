"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useInView } from "@/hooks/useInView";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  HOGE_MINT,
  HOGE_DECIMALS,
} from "@/lib/solana";
import {
  TIER_INFO,
  fetchStakePosition,
  fetchHibernateConfig,
  buildStakeTransaction,
  buildClaimTransaction,
  buildUnstakeTransaction,
  estimatePendingRewards,
  type HibernateTier,
  type StakePositionData,
  type HibernateConfigData,
} from "@/lib/hibernate";

type PanelState = "loading" | "no-wallet" | "no-position" | "has-position";

const TIER_ICONS: Record<HibernateTier, string> = {
  LightSleep: "💤",
  DeepSleep: "😴",
  TrueHibernation: "🧊",
  Permafrost: "❄️",
};

const TIERS: HibernateTier[] = ["LightSleep", "DeepSleep", "TrueHibernation", "Permafrost"];

function formatCountdown(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function HibernatePanel() {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const [ref, isInView] = useInView();

  const [panelState, setPanelState] = useState<PanelState>("loading");
  const [position, setPosition] = useState<StakePositionData | null>(null);
  const [config, setConfig] = useState<HibernateConfigData | null>(null);
  const [selectedTier, setSelectedTier] = useState<HibernateTier | null>(null);
  const [amount, setAmount] = useState("");
  const [hogeBalance, setHogeBalance] = useState<number>(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [status, setStatus] = useState<"idle" | "signing" | "confirming" | "success" | "error">("idle");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<"stake" | "claim" | "unstake" | null>(null);

  const positionRef = useRef(position);
  const configRef = useRef(config);
  positionRef.current = position;
  configRef.current = config;

  const mono = { fontFamily: "var(--font-mono)" };

  // Fetch config, position, and balance
  const fetchData = useCallback(async () => {
    const cfg = await fetchHibernateConfig(connection);
    setConfig(cfg);

    if (!publicKey) {
      setPanelState("no-wallet");
      return;
    }

    try {
      const pos = await fetchStakePosition(connection, publicKey);
      setPosition(pos);
      if (pos) {
        setTimeRemaining(pos.timeRemaining);
        setPanelState("has-position");
      } else {
        setPanelState("no-position");
      }
    } catch {
      setPanelState("no-position");
    }

    // Fetch HOGE balance
    try {
      const ata = getAssociatedTokenAddressSync(
        HOGE_MINT, publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
      );
      const bal = await connection.getTokenAccountBalance(ata);
      setHogeBalance(Number(bal.value.amount) / 10 ** HOGE_DECIMALS);
    } catch {
      setHogeBalance(0);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tick pending rewards + countdown every second
  useEffect(() => {
    const iv = setInterval(() => {
      const pos = positionRef.current;
      const cfg = configRef.current;
      if (pos && cfg) {
        setPendingRewards(estimatePendingRewards(pos, cfg));
        const now = Math.floor(Date.now() / 1000);
        setTimeRemaining(Math.max(0, pos.lockEnd - now));
      }
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // Handle state transitions when wallet connects/disconnects
  useEffect(() => {
    if (!connected) {
      setPanelState("no-wallet");
      setPosition(null);
    }
  }, [connected]);

  const handleStake = async () => {
    if (!publicKey || !signTransaction || !selectedTier) return;
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    setStatus("signing");
    setAction("stake");
    setError(null);
    setTxSig(null);

    try {
      const tx = await buildStakeTransaction(connection, publicKey, selectedTier, num);
      const signed = await signTransaction(tx);
      setStatus("confirming");
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
      setStatus("success");
      setAmount("");
      setSelectedTier(null);
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Stake failed");
      setStatus("error");
    }
  };

  const handleClaim = async () => {
    if (!publicKey || !signTransaction) return;

    setStatus("signing");
    setAction("claim");
    setError(null);
    setTxSig(null);

    try {
      const tx = await buildClaimTransaction(connection, publicKey);
      const signed = await signTransaction(tx);
      setStatus("confirming");
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
      setStatus("success");
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Claim failed");
      setStatus("error");
    }
  };

  const handleUnstake = async () => {
    if (!publicKey || !signTransaction) return;

    setStatus("signing");
    setAction("unstake");
    setError(null);
    setTxSig(null);

    try {
      const tx = await buildUnstakeTransaction(connection, publicKey);
      const signed = await signTransaction(tx);
      setStatus("confirming");
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");
      setTxSig(sig);
      setStatus("success");
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unstake failed");
      setStatus("error");
    }
  };

  const tierInfo = position ? TIER_INFO[position.tier] : null;
  const isLocked = timeRemaining > 0;

  return (
    <section
      ref={ref}
      className={`py-24 max-w-2xl mx-auto px-6 fade-in-section ${isInView ? "is-visible" : ""}`}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-3xl mb-4">🦫</div>
        <h2
          className="text-2xl tracking-[0.3em] text-[#ffaa00] uppercase"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          HIBERNATION PORTAL
        </h2>
        <p className="text-xs text-[#666666] mt-2 tracking-widest" style={mono}>
          DEPARTMENT OF LONG-TERM HOLDINGS
        </p>
      </div>

      <div
        className="border border-[#1a1a2e] rounded-lg p-8"
        style={{ background: "rgba(10,10,15,0.8)" }}
      >
        {/* Loading */}
        {panelState === "loading" && (
          <div className="text-center py-12">
            <div className="text-[#666666] text-sm animate-pulse" style={mono}>
              ACCESSING BURROW SYSTEMS...
            </div>
          </div>
        )}

        {/* No Wallet */}
        {panelState === "no-wallet" && (
          <div className="text-center py-12">
            <p className="text-[#666666] text-sm mb-6" style={mono}>
              CONNECT WALLET TO ENTER THE BURROW
            </p>
            <button
              onClick={() => setVisible(true)}
              className="px-8 py-3 text-xs tracking-widest uppercase cursor-pointer rounded transition-colors"
              style={{
                ...mono,
                border: "1px solid #ffaa00",
                background: "rgba(255,170,0,0.1)",
                color: "#ffaa00",
              }}
            >
              CONNECT WALLET
            </button>
          </div>
        )}

        {/* Has Position */}
        {panelState === "has-position" && position && tierInfo && (
          <div className="space-y-6">
            {/* Tier Badge */}
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ background: tierInfo.color }}
              />
              <span
                className="text-sm tracking-widest uppercase"
                style={{ ...mono, color: tierInfo.color }}
              >
                {tierInfo.label}
              </span>
              <span className="text-lg">{TIER_ICONS[position.tier]}</span>
            </div>

            {/* Amount Staked */}
            <div className="border border-[#1a1a2e] rounded p-4">
              <div className="flex justify-between text-sm mb-3" style={mono}>
                <span className="text-[#666666]">AMOUNT STAKED</span>
                <span className="text-[#e8e6e3]">
                  {position.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} $HOGE
                </span>
              </div>
              <div className="flex justify-between text-sm mb-3" style={mono}>
                <span className="text-[#666666]">LOCK STATUS</span>
                {isLocked ? (
                  <span className="text-[#ffaa00]">{formatCountdown(timeRemaining)}</span>
                ) : (
                  <span className="text-[#00ff88]">UNLOCKED</span>
                )}
              </div>
              <div className="flex justify-between text-sm mb-3" style={mono}>
                <span className="text-[#666666]">ACCRUED ELIXIR</span>
                <span className="text-[#00ff88]">
                  {pendingRewards.toLocaleString("en-US", { maximumFractionDigits: 2 })} $HOGE
                </span>
              </div>
              <div className="flex justify-between text-sm" style={mono}>
                <span className="text-[#666666]">MULTIPLIER</span>
                <span style={{ color: tierInfo.color }}>{tierInfo.multiplier}x ELIXIR</span>
              </div>
            </div>

            {/* Shadow Protection Badge */}
            <div
              className="text-center text-xs tracking-widest py-2 rounded"
              style={{
                ...mono,
                border: "1px solid rgba(0,255,136,0.3)",
                color: "#00ff88",
                background: "rgba(0,255,136,0.05)",
              }}
            >
              🛡️ SHADOW BURN PROTECTED
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {pendingRewards > 0 && (
                <button
                  onClick={handleClaim}
                  disabled={status === "signing" || status === "confirming"}
                  className="flex-1 py-3 text-xs tracking-widest uppercase cursor-pointer rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    ...mono,
                    border: "1px solid #00ff88",
                    background: "rgba(0,255,136,0.15)",
                    color: "#00ff88",
                  }}
                >
                  {status === "signing" && action === "claim"
                    ? "AWAITING SIGNATURE..."
                    : status === "confirming" && action === "claim"
                    ? "CONFIRMING..."
                    : "CLAIM REWARDS"}
                </button>
              )}
              {!isLocked && (
                <button
                  onClick={handleUnstake}
                  disabled={status === "signing" || status === "confirming"}
                  className="flex-1 py-3 text-xs tracking-widest uppercase cursor-pointer rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    ...mono,
                    border: "1px solid #ffaa00",
                    background: "rgba(255,170,0,0.15)",
                    color: "#ffaa00",
                  }}
                >
                  {status === "signing" && action === "unstake"
                    ? "AWAITING SIGNATURE..."
                    : status === "confirming" && action === "unstake"
                    ? "CONFIRMING..."
                    : "EXIT HIBERNATION"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* No Position — Tier Selector + Amount Input */}
        {panelState === "no-position" && (
          <div className="space-y-8">
            {/* Tier Selector */}
            <div>
              <label
                className="text-xs text-[#666666] uppercase tracking-widest block mb-4"
                style={mono}
              >
                SELECT YOUR TIER
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TIERS.map((tier) => {
                  const info = TIER_INFO[tier];
                  const isSelected = selectedTier === tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className="p-4 rounded text-left cursor-pointer transition-all"
                      style={{
                        border: `1px solid ${isSelected ? info.color : "#1a1a2e"}`,
                        background: isSelected ? `${info.color}10` : "transparent",
                        boxShadow: isSelected ? `0 0 20px ${info.color}20` : "none",
                      }}
                    >
                      <div className="text-2xl mb-2">{TIER_ICONS[tier]}</div>
                      <div
                        className="text-xs tracking-widest uppercase mb-1"
                        style={{ ...mono, color: info.color }}
                      >
                        {info.label}
                      </div>
                      <div className="text-[10px] text-[#666666] tracking-widest mb-1" style={mono}>
                        {info.days} DAYS
                      </div>
                      <div className="text-[10px] tracking-widest" style={{ ...mono, color: info.color }}>
                        {info.multiplier}x ELIXIR
                      </div>
                      <div
                        className="text-[9px] mt-2 tracking-widest"
                        style={{ ...mono, color: "#00ff88" }}
                      >
                        🛡️ SHADOW PROTECTED
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Input */}
            {selectedTier && (
              <div>
                <label
                  className="text-xs text-[#666666] uppercase tracking-widest block mb-2"
                  style={mono}
                >
                  AMOUNT TO STAKE
                </label>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setStatus("idle"); }}
                      placeholder="0.00"
                      min="0"
                      step="any"
                      className="w-full bg-transparent border border-[#1a1a2e] rounded px-4 py-3 text-lg text-[#e8e6e3] outline-none focus:border-[#ffaa00] transition-colors pr-20"
                      style={mono}
                    />
                    <span
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#666666]"
                      style={mono}
                    >
                      $HOGE
                    </span>
                  </div>
                  <button
                    onClick={() => setAmount(String(hogeBalance))}
                    className="px-4 py-3 text-xs tracking-widest uppercase cursor-pointer rounded transition-colors"
                    style={{
                      ...mono,
                      border: "1px solid #1a1a2e",
                      color: "#666666",
                    }}
                  >
                    MAX
                  </button>
                </div>
                <p className="text-[10px] text-[#666666] mb-4" style={mono}>
                  BALANCE: {hogeBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })} $HOGE
                  &nbsp;&middot;&nbsp; 6.25% TRANSFER FEE APPLIES ON DEPOSIT
                </p>

                <button
                  onClick={handleStake}
                  disabled={!parseFloat(amount) || status === "signing" || status === "confirming"}
                  className="w-full py-3 text-xs tracking-widest uppercase cursor-pointer rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    ...mono,
                    border: `1px solid ${TIER_INFO[selectedTier].color}`,
                    background: `${TIER_INFO[selectedTier].color}20`,
                    color: TIER_INFO[selectedTier].color,
                  }}
                >
                  {status === "signing" && action === "stake"
                    ? "AWAITING SIGNATURE..."
                    : status === "confirming" && action === "stake"
                    ? "CONFIRMING..."
                    : "ENTER HIBERNATION"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status Messages */}
        {status === "success" && txSig && (
          <div className="mt-4 text-xs text-[#00ff88] text-center" style={mono}>
            {action === "stake" ? "HIBERNATION INITIATED" : action === "claim" ? "REWARDS CLAIMED" : "HIBERNATION ENDED"} —{" "}
            <a
              href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              VIEW ON EXPLORER
            </a>
          </div>
        )}
        {status === "error" && error && (
          <div className="mt-4 text-xs text-[#ff4444] text-center" style={mono}>
            {error}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {config && (
        <div
          className="mt-6 border border-[#1a1a2e] rounded p-4 grid grid-cols-3 gap-4 text-center"
          style={{ background: "rgba(10,10,15,0.5)" }}
        >
          <div>
            <div className="text-[10px] text-[#666666] tracking-widest mb-1" style={mono}>
              TOTAL STAKED
            </div>
            <div className="text-sm text-[#e8e6e3]" style={mono}>
              {config.totalStaked.toLocaleString("en-US", { maximumFractionDigits: 0 })} $HOGE
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#666666] tracking-widest mb-1" style={mono}>
              REWARD RATE
            </div>
            <div className="text-sm text-[#e8e6e3]" style={mono}>
              {((config.rewardRate * 86400) / 10 ** HOGE_DECIMALS).toLocaleString("en-US", { maximumFractionDigits: 0 })}/DAY
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#666666] tracking-widest mb-1" style={mono}>
              YOUR WEIGHT
            </div>
            <div className="text-sm text-[#e8e6e3]" style={mono}>
              {position
                ? position.weightedAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })
                : "—"}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
