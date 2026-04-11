"use client";

import { useState } from "react";
import Link from "next/link";

/* ── Historical decade data ────────────────────────────────────── */
const DECADES = [
  { range: "1887 – 1899", shadow: 12, noShadow: 1, canceled: 0, note: null },
  { range: "1900 – 1919", shadow: 17, noShadow: 2, canceled: 1, note: null },
  { range: "1920 – 1939", shadow: 18, noShadow: 2, canceled: 0, note: null },
  { range: "1940 – 1959", shadow: 17, noShadow: 2, canceled: 1, note: "1943 — wartime suspension" },
  { range: "1960 – 1979", shadow: 18, noShadow: 2, canceled: 0, note: null },
  { range: "1980 – 1999", shadow: 14, noShadow: 6, canceled: 0, note: "trend shift" },
  { range: "2000 – 2019", shadow: 15, noShadow: 5, canceled: 0, note: null },
  { range: "2020 – 2026", shadow: 4, noShadow: 3, canceled: 0, note: "most volatile era" },
];

/* ── Supply calculator constants ──────────────────────────────── */
const BASE_SUPPLY = 1_883_000_000;
const BURN_RATE = 0.06;
const MINT_RATE = 0.039;

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

/* ── Snowflake SVG ────────────────────────────────────────────── */
function SnowflakeIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="#4488ff"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="mx-auto mb-4 opacity-80"
    >
      {/* Main axes */}
      <line x1="32" y1="4" x2="32" y2="60" />
      <line x1="7.7" y1="18" x2="56.3" y2="46" />
      <line x1="7.7" y1="46" x2="56.3" y2="18" />
      {/* Branches on vertical axis */}
      <line x1="32" y1="12" x2="26" y2="18" />
      <line x1="32" y1="12" x2="38" y2="18" />
      <line x1="32" y1="52" x2="26" y2="46" />
      <line x1="32" y1="52" x2="38" y2="46" />
      {/* Branches on diagonal axes */}
      <line x1="14" y1="21" x2="16" y2="28" />
      <line x1="50" y1="43" x2="48" y2="36" />
      <line x1="14" y1="43" x2="16" y2="36" />
      <line x1="50" y1="21" x2="48" y2="28" />
      {/* Center diamond */}
      <path d="M32 26 L38 32 L32 38 L26 32 Z" strokeWidth="1" />
    </svg>
  );
}

/* ── Sun SVG ──────────────────────────────────────────────────── */
function SunIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="#00ff88"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="mx-auto mb-4 opacity-80"
    >
      <circle cx="32" cy="32" r="12" />
      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 32 + Math.cos(rad) * 17;
        const y1 = 32 + Math.sin(rad) * 17;
        const x2 = 32 + Math.cos(rad) * 26;
        const y2 = 32 + Math.sin(rad) * 26;
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export default function PredictContent() {
  const [supplyBase] = useState(BASE_SUPPLY);

  const burnAmount = Math.round(supplyBase * BURN_RATE);
  const mintAmount = Math.round(supplyBase * MINT_RATE);
  const afterBurn = supplyBase - burnAmount;
  const afterMint = supplyBase + mintAmount;
  const netDifference = burnAmount + mintAmount;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-6xl px-4 py-12">

        {/* ── Page Header ──────────────────────────────────────── */}
        <header className="mb-16 text-center">
          <Link
            href="/"
            className="inline-block mb-8 text-sm tracking-widest uppercase transition-colors hover:opacity-80"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            &lt; RETURN TO HEADQUARTERS
          </Link>

          <p
            className="text-xs tracking-[0.3em] uppercase mb-2"
            style={{ color: "#ffaa00", fontFamily: "var(--font-mono)" }}
          >
            GROUNDHOGE DAY ECONOMIC AUTHORITY
          </p>
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ fontFamily: "var(--font-serif)", color: "var(--text)" }}
          >
            SHADOW FUTURES
          </h1>
          <p
            className="text-sm tracking-[0.2em] uppercase"
            style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
          >
            PREDICTION MARKET &mdash; FEBRUARY 2, 2027
          </p>
        </header>

        {/* ── Section 1: Current Market ────────────────────────── */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Shadow panel */}
            <div
              className="relative overflow-hidden rounded-lg p-8 text-center"
              style={{
                border: "1px solid rgba(68, 136, 255, 0.25)",
                background: "linear-gradient(135deg, rgba(68,136,255,0.06) 0%, rgba(68,136,255,0.02) 100%)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 60px rgba(68, 136, 255, 0.05)",
                }}
              />
              <SnowflakeIcon />
              <h2
                className="text-2xl md:text-3xl font-bold mb-1"
                style={{ fontFamily: "var(--font-serif)", color: "#4488ff" }}
              >
                SHADOW
              </h2>
              <p
                className="text-xs tracking-widest uppercase mb-6"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                6 MORE WEEKS OF WINTER
              </p>

              <p
                className="text-4xl md:text-5xl font-bold mb-1"
                style={{
                  color: "#4488ff",
                  fontFamily: "var(--font-mono)",
                  textShadow: "0 0 20px rgba(68, 136, 255, 0.4)",
                }}
              >
                84.1%
              </p>
              <p
                className="text-xs uppercase tracking-widest mb-6"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                PROBABILITY
              </p>

              <div className="space-y-2 text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>
                <p>HISTORICAL FREQUENCY: <span style={{ color: "#4488ff" }}>109/129 (84.5%)</span></p>
                <p style={{ color: "#ff4444" }}>IF SHADOW: 6% of $HOGE supply burned</p>
              </div>
            </div>

            {/* No Shadow panel */}
            <div
              className="relative overflow-hidden rounded-lg p-8 text-center"
              style={{
                border: "1px solid rgba(0, 255, 136, 0.25)",
                background: "linear-gradient(135deg, rgba(0,255,136,0.06) 0%, rgba(0,255,136,0.02) 100%)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 60px rgba(0, 255, 136, 0.05)",
                }}
              />
              <SunIcon />
              <h2
                className="text-2xl md:text-3xl font-bold mb-1"
                style={{ fontFamily: "var(--font-serif)", color: "#00ff88" }}
              >
                NO SHADOW
              </h2>
              <p
                className="text-xs tracking-widest uppercase mb-6"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                EARLY SPRING
              </p>

              <p
                className="text-4xl md:text-5xl font-bold mb-1"
                style={{
                  color: "#00ff88",
                  fontFamily: "var(--font-mono)",
                  textShadow: "0 0 20px rgba(0, 255, 136, 0.4)",
                }}
              >
                15.9%
              </p>
              <p
                className="text-xs uppercase tracking-widest mb-6"
                style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
              >
                PROBABILITY
              </p>

              <div className="space-y-2 text-sm" style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>
                <p>HISTORICAL FREQUENCY: <span style={{ color: "#00ff88" }}>20/129 (15.5%)</span></p>
                <p style={{ color: "#00ff88" }}>IF NO SHADOW: 3.9% of $HOGE supply minted</p>
              </div>
            </div>

          </div>
        </section>

        {/* ── Section 2: Historical Analysis ───────────────────── */}
        <section className="mb-20">
          <h2
            className="text-xs tracking-[0.3em] uppercase mb-1 text-center"
            style={{ color: "#ffaa00", fontFamily: "var(--font-mono)" }}
          >
            SECTION II
          </h2>
          <h3
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ fontFamily: "var(--font-serif)", color: "var(--text)" }}
          >
            HISTORICAL ANALYSIS
          </h3>

          <div
            className="overflow-x-auto rounded-lg"
            style={{ border: "1px solid var(--card-border)" }}
          >
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-mono)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--card-border)", background: "rgba(255,255,255,0.02)" }}>
                  <th className="px-4 py-3 text-left uppercase tracking-widest text-xs" style={{ color: "var(--muted)" }}>Period</th>
                  <th className="px-4 py-3 text-center uppercase tracking-widest text-xs" style={{ color: "#4488ff" }}>Shadow</th>
                  <th className="px-4 py-3 text-center uppercase tracking-widest text-xs" style={{ color: "#00ff88" }}>No Shadow</th>
                  <th className="px-4 py-3 text-center uppercase tracking-widest text-xs" style={{ color: "var(--muted)" }}>Other</th>
                  <th className="px-4 py-3 text-right uppercase tracking-widest text-xs" style={{ color: "#ffaa00" }}>Shadow Rate</th>
                  <th className="px-4 py-3 text-left uppercase tracking-widest text-xs" style={{ color: "var(--muted)" }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {DECADES.map((d, i) => {
                  const total = d.shadow + d.noShadow;
                  const rate = total > 0 ? ((d.shadow / total) * 100).toFixed(1) : "—";
                  const isVolatile = parseFloat(rate) < 70;
                  return (
                    <tr
                      key={d.range}
                      style={{
                        borderBottom: i < DECADES.length - 1 ? "1px solid var(--card-border)" : undefined,
                        background: isVolatile ? "rgba(255, 170, 0, 0.04)" : "transparent",
                      }}
                    >
                      <td className="px-4 py-3" style={{ color: "var(--text)" }}>{d.range}</td>
                      <td className="px-4 py-3 text-center" style={{ color: "#4488ff" }}>{d.shadow}</td>
                      <td className="px-4 py-3 text-center" style={{ color: "#00ff88" }}>{d.noShadow}</td>
                      <td className="px-4 py-3 text-center" style={{ color: "var(--muted)" }}>{d.canceled > 0 ? `${d.canceled} canceled` : "—"}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: isVolatile ? "#ffaa00" : "var(--text)" }}>{rate}%</td>
                      <td className="px-4 py-3 text-xs" style={{ color: d.note ? "#ffaa00" : "var(--muted)" }}>
                        {d.note ? d.note.toUpperCase() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            className="mt-6 rounded-lg p-5 text-sm leading-relaxed"
            style={{
              border: "1px solid var(--card-border)",
              background: "rgba(255, 170, 0, 0.04)",
              fontFamily: "var(--font-mono)",
              color: "var(--muted)",
            }}
          >
            <span style={{ color: "#ffaa00" }}>ANALYST NOTE:</span>{" "}
            The Oracle has shown an increasing willingness to call no-shadow in the modern era.
            Whether this reflects changing climate, evolving Groundhogese interpretation, or the
            Inner Circle&apos;s shifting preferences is classified.
          </div>
        </section>

        {/* ── Section 3: Supply Impact Calculator ──────────────── */}
        <section className="mb-20">
          <h2
            className="text-xs tracking-[0.3em] uppercase mb-1 text-center"
            style={{ color: "#ffaa00", fontFamily: "var(--font-mono)" }}
          >
            SECTION III
          </h2>
          <h3
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ fontFamily: "var(--font-serif)", color: "var(--text)" }}
          >
            SUPPLY IMPACT CALCULATOR
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-6">

            {/* Shadow scenario */}
            <div
              className="rounded-lg p-6"
              style={{ border: "1px solid rgba(68, 136, 255, 0.25)", background: "rgba(68,136,255,0.03)" }}
            >
              <h4
                className="text-xs tracking-widest uppercase mb-4"
                style={{ color: "#4488ff", fontFamily: "var(--font-mono)" }}
              >
                SHADOW SCENARIO &mdash; BURN
              </h4>
              <div className="space-y-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>Current supply</span>
                  <span style={{ color: "var(--text)" }}>{fmt(supplyBase)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#ff4444" }}>Burned (6%)</span>
                  <span style={{ color: "#ff4444" }}>-{fmt(burnAmount)}</span>
                </div>
                <div
                  className="flex justify-between pt-3"
                  style={{ borderTop: "1px solid var(--card-border)" }}
                >
                  <span style={{ color: "var(--muted)" }}>Resulting supply</span>
                  <span className="font-bold" style={{ color: "#4488ff" }}>{fmt(afterBurn)}</span>
                </div>
              </div>
            </div>

            {/* No Shadow scenario */}
            <div
              className="rounded-lg p-6"
              style={{ border: "1px solid rgba(0, 255, 136, 0.25)", background: "rgba(0,255,136,0.03)" }}
            >
              <h4
                className="text-xs tracking-widest uppercase mb-4"
                style={{ color: "#00ff88", fontFamily: "var(--font-mono)" }}
              >
                NO SHADOW SCENARIO &mdash; MINT
              </h4>
              <div className="space-y-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>Current supply</span>
                  <span style={{ color: "var(--text)" }}>{fmt(supplyBase)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#00ff88" }}>Minted (3.9%)</span>
                  <span style={{ color: "#00ff88" }}>+{fmt(mintAmount)}</span>
                </div>
                <div
                  className="flex justify-between pt-3"
                  style={{ borderTop: "1px solid var(--card-border)" }}
                >
                  <span style={{ color: "var(--muted)" }}>Resulting supply</span>
                  <span className="font-bold" style={{ color: "#00ff88" }}>{fmt(afterMint)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Net difference */}
          <div
            className="rounded-lg p-5 text-center"
            style={{
              border: "1px solid var(--card-border)",
              background: "rgba(255, 170, 0, 0.04)",
            }}
          >
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              NET DIFFERENCE BETWEEN OUTCOMES
            </p>
            <p
              className="text-2xl md:text-3xl font-bold"
              style={{ color: "#ffaa00", fontFamily: "var(--font-mono)" }}
            >
              {fmt(netDifference)} $HOGE
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
              Total supply swing depending on the Oracle&apos;s decree
            </p>
          </div>
        </section>

        {/* ── Section 4: Market Status ─────────────────────────── */}
        <section className="mb-12">
          <h2
            className="text-xs tracking-[0.3em] uppercase mb-1 text-center"
            style={{ color: "#ffaa00", fontFamily: "var(--font-mono)" }}
          >
            SECTION IV
          </h2>
          <h3
            className="text-2xl md:text-3xl font-bold mb-8 text-center"
            style={{ fontFamily: "var(--font-serif)", color: "var(--text)" }}
          >
            MARKET STATUS
          </h3>

          <div
            className="rounded-lg p-8 text-center"
            style={{ border: "1px solid var(--card-border)", background: "rgba(255, 170, 0, 0.03)" }}
          >
            {/* Badge */}
            <div
              className="inline-block rounded px-5 py-2 mb-6 text-sm font-bold tracking-widest uppercase"
              style={{
                color: "#ffaa00",
                border: "1px solid rgba(255, 170, 0, 0.4)",
                background: "rgba(255, 170, 0, 0.08)",
                fontFamily: "var(--font-mono)",
              }}
            >
              PREDICTION MARKET: COMING Q1 2027
            </div>

            <div
              className="max-w-xl mx-auto space-y-4 text-sm leading-relaxed"
              style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}
            >
              <p>
                On-chain prediction pools will open 30 days before the ceremony.
                Deposit SOL, pick <span style={{ color: "#4488ff" }}>SHADOW</span> or{" "}
                <span style={{ color: "#00ff88" }}>NO SHADOW</span>.
                Winner takes the pool.
              </p>
              <p>
                Powered by the Groundhoge Day Economic Authority.
                Resolution determined by the ceremony API.
              </p>
              <p style={{ color: "var(--text)", fontStyle: "italic" }}>
                The Oracle does not participate in prediction markets. The Oracle already knows.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
