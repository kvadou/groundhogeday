"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useInView } from "@/hooks/useInView";
import {
  getSwapQuote, getPoolReserves, executeSwap,
  type SwapDirection, type SwapQuote,
} from "@/lib/swap";
import { formatHoge, formatSol } from "@/lib/solana";

export default function SwapPanel() {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const [ref, isInView] = useInView();

  const [direction, setDirection] = useState<SwapDirection>("buy");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [reserves, setReserves] = useState<{
    hogeReserve: number;
    solReserve: number;
  } | null>(null);
  const [status, setStatus] = useState<
    "idle" | "signing" | "confirming" | "success" | "error"
  >("idle");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mono = { fontFamily: "var(--font-mono)" };

  const fetchReserves = useCallback(async () => {
    try {
      const r = await getPoolReserves(connection);
      setReserves(r);
    } catch {}
  }, [connection]);

  useEffect(() => {
    fetchReserves();
    const iv = setInterval(fetchReserves, 15_000);
    return () => clearInterval(iv);
  }, [fetchReserves]);

  useEffect(() => {
    const num = parseFloat(amount);
    if (!num || num <= 0 || !reserves) {
      setQuote(null);
      return;
    }
    const q = getSwapQuote(
      direction, num, reserves.hogeReserve, reserves.solReserve, slippage * 100
    );
    setQuote(q);
  }, [amount, direction, reserves, slippage]);

  const handleSwap = async () => {
    if (!publicKey || !signTransaction || !quote) return;
    setStatus("signing");
    setError(null);
    setTxSig(null);
    try {
      const sig = await executeSwap(
        connection,
        { publicKey, signTransaction },
        quote.direction,
        quote.amountInRaw,
        quote.minOutRaw,
      );
      setTxSig(sig);
      setStatus("success");
      setAmount("");
      fetchReserves();
    } catch (err: any) {
      setError(err.message || "Swap failed");
      setStatus("error");
    }
  };

  const inputLabel = direction === "buy" ? "SOL" : "$HOGE";

  return (
    <section
      ref={ref}
      className={`py-24 max-w-2xl mx-auto px-6 fade-in-section ${isInView ? "is-visible" : ""}`}
    >
      <h2
        className="text-center tracking-[0.3em] text-sm text-[#666666] uppercase"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        THE BURROW — TRADING FLOOR
      </h2>
      <p className="text-center text-xs text-[#666666] mt-2" style={mono}>
        DEVNET ONLY &middot; x&middot;y=k AMM
      </p>

      <div
        className="mt-12 border border-[#1a1a2e] rounded-lg p-8"
        style={{ background: "rgba(10,10,15,0.8)" }}
      >
        {/* Direction toggle */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => { setDirection("buy"); setAmount(""); setStatus("idle"); }}
            className="flex-1 py-2 text-xs tracking-widest uppercase transition-colors cursor-pointer rounded"
            style={{
              ...mono,
              background: direction === "buy" ? "rgba(0,255,136,0.15)" : "transparent",
              border: `1px solid ${direction === "buy" ? "#00ff88" : "#1a1a2e"}`,
              color: direction === "buy" ? "#00ff88" : "#666666",
            }}
          >
            BUY $HOGE
          </button>
          <button
            onClick={() => { setDirection("sell"); setAmount(""); setStatus("idle"); }}
            className="flex-1 py-2 text-xs tracking-widest uppercase transition-colors cursor-pointer rounded"
            style={{
              ...mono,
              background: direction === "sell" ? "rgba(255,170,0,0.15)" : "transparent",
              border: `1px solid ${direction === "sell" ? "#ffaa00" : "#1a1a2e"}`,
              color: direction === "sell" ? "#ffaa00" : "#666666",
            }}
          >
            SELL $HOGE
          </button>
        </div>

        {/* Amount input */}
        <div className="mb-6">
          <label
            className="text-xs text-[#666666] uppercase tracking-widest block mb-2"
            style={mono}
          >
            YOU PAY ({inputLabel})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setStatus("idle"); }}
            placeholder="0.00"
            min="0"
            step="any"
            className="w-full bg-transparent border border-[#1a1a2e] rounded px-4 py-3 text-lg text-[#e8e6e3] outline-none focus:border-[#ffaa00] transition-colors"
            style={mono}
          />
        </div>

        {/* Quote output */}
        {quote && (
          <div className="mb-6 border border-[#1a1a2e] rounded p-4" style={mono}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#666666]">YOU RECEIVE (EST.)</span>
              <span style={{ color: direction === "buy" ? "#00ff88" : "#ffaa00" }}>
                {direction === "buy"
                  ? `${formatHoge(quote.estimatedOutRaw)} $HOGE`
                  : `${formatSol(quote.estimatedOutRaw)} SOL`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#666666] mb-1">
              <span>MIN. RECEIVED ({slippage}% SLIPPAGE)</span>
              <span>
                {direction === "buy"
                  ? `${formatHoge(quote.minOutRaw)} $HOGE`
                  : `${formatSol(quote.minOutRaw)} SOL`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#666666] mb-1">
              <span>PRICE IMPACT</span>
              <span style={{ color: quote.priceImpact > 5 ? "#ff4444" : "#666666" }}>
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#666666]">
              <span>LP FEE (0.3%)</span>
              <span>
                {quote.fee.toFixed(direction === "buy" ? 6 : 2)} {inputLabel}
              </span>
            </div>
          </div>
        )}

        {/* Slippage setting */}
        <div className="flex items-center gap-3 mb-8 text-xs text-[#666666]" style={mono}>
          <span>SLIPPAGE:</span>
          {[0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSlippage(s)}
              className="px-2 py-1 rounded cursor-pointer transition-colors"
              style={{
                border: `1px solid ${slippage === s ? "#ffaa00" : "#1a1a2e"}`,
                color: slippage === s ? "#ffaa00" : "#666666",
              }}
            >
              {s}%
            </button>
          ))}
        </div>

        {/* Execute button */}
        {!connected ? (
          <button
            onClick={() => setVisible(true)}
            className="w-full py-3 text-xs tracking-widest uppercase cursor-pointer rounded transition-colors"
            style={{
              ...mono,
              border: "1px solid #ffaa00",
              background: "rgba(255,170,0,0.1)",
              color: "#ffaa00",
            }}
          >
            CONNECT WALLET TO TRADE
          </button>
        ) : (
          <button
            onClick={handleSwap}
            disabled={!quote || status === "signing" || status === "confirming"}
            className="w-full py-3 text-xs tracking-widest uppercase cursor-pointer rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              ...mono,
              border: `1px solid ${direction === "buy" ? "#00ff88" : "#ffaa00"}`,
              background: direction === "buy"
                ? "rgba(0,255,136,0.15)"
                : "rgba(255,170,0,0.15)",
              color: direction === "buy" ? "#00ff88" : "#ffaa00",
            }}
          >
            {status === "signing"
              ? "AWAITING SIGNATURE..."
              : status === "confirming"
              ? "CONFIRMING..."
              : `EXECUTE ${direction.toUpperCase()}`}
          </button>
        )}

        {/* Status messages */}
        {status === "success" && txSig && (
          <div className="mt-4 text-xs text-[#00ff88] text-center" style={mono}>
            SWAP COMPLETE —{" "}
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
    </section>
  );
}
