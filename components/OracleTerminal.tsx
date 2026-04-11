"use client";

import { useState, useRef, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { predictions, getSupplyEvent } from "@/lib/shadow-history";
import type { Prediction } from "@/lib/shadow-history";
import { useInView } from "@/hooks/useInView";
import { getSwapQuote, getPoolReserves, executeSwap } from "@/lib/swap";
import { formatHoge, formatSol } from "@/lib/solana";

function getOutcome(p: Prediction): string {
  if (p.shadow === null) return "NO CEREMONY";
  return p.shadow ? "SHADOW" : "NO SHADOW";
}

function getDuration(p: Prediction): string {
  if (p.shadow === null) return "\u2014";
  return p.shadow ? "6 WKS WINTER" : "EARLY SPRING";
}

function getStatusLabel(p: Prediction): string {
  switch (p.status) {
    case "revealed":
      return "REVEALED";
    case "pending":
      return "PENDING";
    case "suspended":
      return "SUSPENDED";
  }
}

function getDaysUntilProphecy(): { days: number; total: number } {
  const now = new Date();
  const nextCeremony = new Date(2027, 1, 2, 7, 25, 0); // Feb 2, 2027
  const lastCeremony = new Date(2026, 1, 2, 7, 25, 0); // Feb 2, 2026
  const total = Math.round(
    (nextCeremony.getTime() - lastCeremony.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsed = Math.round(
    (now.getTime() - lastCeremony.getTime()) / (1000 * 60 * 60 * 24)
  );
  const days = Math.max(0, total - elapsed);
  return { days, total };
}

function ProgressBar({ days, total }: { days: number; total: number }) {
  const elapsed = total - days;
  const barWidth = 30;
  const filled = Math.round((elapsed / total) * barWidth);
  const empty = barWidth - filled;
  return (
    <span>
      {"\u2588".repeat(filled)}
      {"\u2591".repeat(empty)} {days}/{total}
    </span>
  );
}

interface TermLine {
  prompt: boolean;
  text: string;
  color?: string;
}

export default function OracleTerminal() {
  const [expanded, setExpanded] = useState(false);
  const [ref, isInView] = useInView();
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [cmdInput, setCmdInput] = useState("");
  const [termLines, setTermLines] = useState<TermLine[]>([]);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addLine = useCallback((text: string, color?: string, prompt = false) => {
    setTermLines((prev) => [...prev, { prompt, text, color }]);
  }, []);

  const handleCommand = useCallback(async (raw: string) => {
    const input = raw.trim().toLowerCase();
    if (!input) return;

    addLine(input, "#ffaa00", true);
    setProcessing(true);

    try {
      if (input === "help") {
        addLine("AVAILABLE COMMANDS:", "#00ff88");
        addLine("  buy <sol_amount>              — Buy $HOGE with SOL");
        addLine("  sell <hoge_amount>            — Sell $HOGE for SOL");
        addLine("  quote buy|sell <amount>       — Preview without executing");
        addLine("  reserves                      — Show pool reserves");
        addLine("  help                          — This message");
        addLine("  Append 'slippage <pct>' to set custom slippage (default 1%)");
      } else if (input === "reserves") {
        const r = await getPoolReserves(connection);
        addLine(`HOGE VAULT: ${formatHoge(r.hogeReserve)} $HOGE`, "#ffaa00");
        addLine(`SOL VAULT:  ${formatSol(r.solReserve)} SOL`, "#00ff88");
      } else if (input.startsWith("quote ")) {
        const parts = input.split(/\s+/);
        const dir = parts[1] as "buy" | "sell";
        const amt = parseFloat(parts[2]);
        if (!["buy", "sell"].includes(dir) || isNaN(amt) || amt <= 0) {
          addLine("USAGE: quote buy|sell <amount>", "#ff4444");
        } else {
          const r = await getPoolReserves(connection);
          let slip = 100;
          const slipIdx = parts.indexOf("slippage");
          if (slipIdx !== -1) slip = parseFloat(parts[slipIdx + 1]) * 100 || 100;
          const q = getSwapQuote(dir, amt, r.hogeReserve, r.solReserve, slip);
          const outLabel = dir === "buy" ? "$HOGE" : "SOL";
          const inLabel = dir === "buy" ? "SOL" : "$HOGE";
          addLine(`${dir.toUpperCase()} ${amt} ${inLabel}`, "#ffaa00");
          addLine(`  EST. OUTPUT:    ${dir === "buy" ? formatHoge(q.estimatedOutRaw) : formatSol(q.estimatedOutRaw)} ${outLabel}`, "#00ff88");
          addLine(`  MIN. OUTPUT:    ${dir === "buy" ? formatHoge(q.minOutRaw) : formatSol(q.minOutRaw)} ${outLabel}`);
          addLine(`  PRICE IMPACT:   ${q.priceImpact.toFixed(2)}%`);
          addLine(`  FEE (0.3%):     ${q.fee.toFixed(6)} ${inLabel}`);
        }
      } else if (input.startsWith("buy ") || input.startsWith("sell ")) {
        if (!connected || !publicKey || !signTransaction) {
          addLine("ERROR: Connect wallet first.", "#ff4444");
        } else {
          const parts = input.split(/\s+/);
          const dir = parts[0] as "buy" | "sell";
          const amt = parseFloat(parts[1]);
          if (isNaN(amt) || amt <= 0) {
            addLine(`USAGE: ${dir} <amount>`, "#ff4444");
          } else {
            const r = await getPoolReserves(connection);
            let slip = 100;
            const slipIdx = parts.indexOf("slippage");
            if (slipIdx !== -1) slip = parseFloat(parts[slipIdx + 1]) * 100 || 100;
            const q = getSwapQuote(dir, amt, r.hogeReserve, r.solReserve, slip);
            const outLabel = dir === "buy" ? "$HOGE" : "SOL";
            addLine(`EXECUTING ${dir.toUpperCase()}: ${amt} → ~${dir === "buy" ? formatHoge(q.estimatedOutRaw) : formatSol(q.estimatedOutRaw)} ${outLabel}...`, "#ffaa00");
            const sig = await executeSwap(
              connection,
              { publicKey, signTransaction },
              dir,
              q.amountInRaw,
              q.minOutRaw,
            );
            addLine(`SWAP COMPLETE. TX: ${sig.slice(0, 20)}...`, "#00ff88");
            addLine(`https://explorer.solana.com/tx/${sig}?cluster=devnet`, "#4488ff");
          }
        }
      } else {
        addLine(`UNKNOWN COMMAND: ${input}. Type 'help' for commands.`, "#ff4444");
      }
    } catch (err: any) {
      addLine(`ERROR: ${err.message || "Command failed"}`, "#ff4444");
    }

    setProcessing(false);
  }, [connection, connected, publicKey, signTransaction, addLine]);

  const sorted = [...predictions].sort((a, b) => b.year - a.year);
  const displayData = expanded ? sorted : sorted.slice(0, 15);

  const { days, total } = getDaysUntilProphecy();

  const mono = { fontFamily: "var(--font-mono)" };

  return (
    <section
      id="oracle-terminal"
      ref={ref}
      style={{ backgroundColor: "#060610", borderTop: "1px solid #1a1a2e" }}
      className={`w-full py-24 fade-in-section ${isInView ? "is-visible" : ""}`}
    >
      {/* Header */}
      <h2
        style={mono}
        className="text-xs tracking-widest text-[#ffaa00] text-center"
      >
        GOBBLER&apos;S KNOB TERMINAL &mdash; REVELATION ARCHIVE
      </h2>

      {/* Data Table */}
      <div className="mt-12 max-w-5xl mx-auto px-6 overflow-x-auto" style={mono}>
        <div className="min-w-[500px]">
          {/* Column Headers */}
          <div
            className="grid grid-cols-5 text-xs text-[#666666] uppercase pb-2"
            style={{ borderBottom: "1px solid #1a1a2e" }}
          >
            <span>YEAR</span>
            <span>OUTCOME</span>
            <span>DURATION</span>
            <span>STATUS</span>
            <span>SUPPLY EVENT</span>
          </div>

          {/* Rows */}
          <div
            className={expanded ? "max-h-96 overflow-y-auto" : ""}
            style={{
              scrollbarColor: "#1a1a2e #060610",
            }}
          >
            {displayData.map((p) => {
              const is1943 = p.shadow === null;
              const isNoShadow = p.shadow === false;
              const is2026 = p.year === 2026;

              let rowColor = "text-[#ffaa00]"; // shadow
              if (isNoShadow) rowColor = "text-[#00ff88]";
              if (is1943) rowColor = "text-red-500";

              return (
                <div
                  key={p.year}
                  className={`grid grid-cols-5 text-xs py-1.5 ${rowColor} ${
                    is2026 ? "border-l-2 border-[#ffaa00] pl-2" : ""
                  }`}
                >
                  <span>{p.year}</span>
                  <span>{getOutcome(p)}</span>
                  <span>{getDuration(p)}</span>
                  <span>{getStatusLabel(p)}</span>
                  <span>{getSupplyEvent(p.shadow)}</span>
                </div>
              );
            })}
          </div>

          {/* Expand / Collapse */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 text-xs text-[#4488ff] hover:text-[#6699ff] transition-colors cursor-pointer"
            style={mono}
          >
            {expanded
              ? "COLLAPSE ARCHIVE"
              : "EXPAND FULL ARCHIVE (1887\u20132026)"}
          </button>
        </div>
      </div>

      {/* Terminal Prompt Block */}
      <div
        className="mt-12 max-w-3xl mx-auto rounded p-6"
        style={{
          ...mono,
          backgroundColor: "#050508",
          border: "1px solid #1a1a2e",
        }}
      >
        <div className="text-xs leading-6">
          <div>
            <span className="text-[#00ff88]">gobbler-knob:~ $ </span>
            <span className="text-[#ffaa00]">
              CURRENT ORACLE STATUS: HIBERNATING
            </span>
          </div>
          <div>
            <span className="text-[#00ff88]">gobbler-knob:~ $ </span>
            <span className="text-[#ffaa00]">
              NEXT SCHEDULED EMERGENCE: 2027-02-02T07:25:00-05:00
            </span>
          </div>
          <div>
            <span className="text-[#00ff88]">gobbler-knob:~ $ </span>
            <span className="text-[#ffaa00]">
              DAYS UNTIL PROPHECY:{" "}
              <ProgressBar days={days} total={total} />
            </span>
          </div>
          {/* Command history */}
          {termLines.map((line, i) => (
            <div key={i}>
              {line.prompt && (
                <span className="text-[#00ff88]">gobbler-knob:~ $ </span>
              )}
              <span style={{ color: line.color || "#e8e6e3" }}>{line.text}</span>
            </div>
          ))}
          {/* Interactive input */}
          <div className="flex items-center">
            <span className="text-[#00ff88]">gobbler-knob:~ $ </span>
            <input
              ref={inputRef}
              type="text"
              value={cmdInput}
              onChange={(e) => setCmdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !processing) {
                  handleCommand(cmdInput);
                  setCmdInput("");
                }
              }}
              disabled={processing}
              placeholder={processing ? "processing..." : "type 'help' for commands"}
              className="flex-1 bg-transparent outline-none text-[#ffaa00] placeholder-[#333]"
              style={{ fontFamily: "var(--font-mono)", fontSize: "inherit", caretColor: "#ffaa00" }}
            />
          </div>
        </div>
      </div>

      {/* LED Stat Bar */}
      <div
        className="mt-8 text-center text-sm text-[#00ff88]"
        style={{
          ...mono,
          textShadow: "0 0 10px rgba(0,255,136,0.3)",
        }}
      >
        TOTAL REVELATIONS: 139 &nbsp;|&nbsp; SHADOW: 109 &nbsp;|&nbsp; NO SHADOW: 20
        &nbsp;|&nbsp; ACCURACY: 100%
      </div>
    </section>
  );
}
