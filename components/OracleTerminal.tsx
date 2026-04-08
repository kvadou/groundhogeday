"use client";

import { useState } from "react";
import { predictions, getMarketImpact } from "@/lib/shadow-history";
import type { Prediction } from "@/lib/shadow-history";

function getOutcome(p: Prediction): string {
  if (p.shadow === null) return "NO CEREMONY";
  return p.shadow ? "SHADOW" : "NO SHADOW";
}

function getDuration(p: Prediction): string {
  if (p.shadow === null) return "\u2014";
  return p.shadow ? "6 WKS WINTER" : "EARLY SPRING";
}

function getAccuracyLabel(p: Prediction): string {
  switch (p.accuracy) {
    case "correct":
      return "CORRECT";
    case "incorrect":
      return "INCORRECT";
    case "pending":
      return "PENDING";
    case "no-record":
      return "\u2014";
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

export default function OracleTerminal() {
  const [expanded, setExpanded] = useState(false);

  const sorted = [...predictions].sort((a, b) => b.year - a.year);
  const displayData = expanded ? sorted : sorted.slice(0, 15);

  const { days, total } = getDaysUntilProphecy();

  const mono = { fontFamily: "var(--font-mono)" };

  return (
    <section
      style={{ backgroundColor: "#060610", borderTop: "1px solid #1a1a2e" }}
      className="w-full py-24"
    >
      {/* Header */}
      <h2
        style={mono}
        className="text-xs tracking-widest text-[#ffaa00] text-center"
      >
        GOBBLER&apos;S KNOB TERMINAL &mdash; SHADOW HISTORY DATABASE
      </h2>

      {/* Data Table */}
      <div className="mt-12 max-w-5xl mx-auto px-6" style={mono}>
        {/* Column Headers */}
        <div
          className="grid grid-cols-5 text-xs text-[#666666] uppercase pb-2"
          style={{ borderBottom: "1px solid #1a1a2e" }}
        >
          <span>YEAR</span>
          <span>OUTCOME</span>
          <span>DURATION</span>
          <span>ACCURACY</span>
          <span>MARKET IMPACT</span>
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
                <span>{getAccuracyLabel(p)}</span>
                <span>{getMarketImpact(p.shadow)}</span>
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
          <div>
            <span className="text-[#00ff88]">gobbler-knob:~ $ </span>
            <span className="animate-blink text-[#ffaa00]">_</span>
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
        TOTAL SHADOWS: 109 &nbsp;|&nbsp; TOTAL NO-SHADOWS: 20
        &nbsp;|&nbsp; CAREER ACCURACY: 39%
      </div>
    </section>
  );
}
