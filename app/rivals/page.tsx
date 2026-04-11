"use client";

import Link from "next/link";

/* ─── Rival Token Data ─── */
const RIVALS = [
  {
    ticker: "$CHUCK",
    name: "Staten Island Chuck Token",
    tagline: "The Violent Fork",
    color: "#ff4444",
    stats: [
      { label: "MARKET CAP", value: "$BITTEN" },
      { label: "24H VOLUME", value: "1 MAYOR" },
      { label: "HOLDERS", value: "DECLINING (BITE RISK)" },
    ],
    note: "$CHUCK has a history of attacking major holders. The founding groundhog bit Mayor Bloomberg in 2009. The successor was fatally dropped by Mayor de Blasio. Investor relations are hostile.",
    status: "HIGH RISK \u2014 PHYSICAL DANGER TO HOLDERS",
  },
  {
    ticker: "$BERT",
    name: "Buffalo Bert Token",
    tagline: "The Rigged Stablecoin",
    color: "#4488ff",
    stats: [
      { label: "MARKET CAP", value: "FROZEN" },
      { label: "24H VOLUME", value: "0 (ALWAYS WINTER)" },
      { label: "ACCURACY", value: "100% (RIGGED)" },
    ],
    note: "$BERT is engineered to always see his shadow. The token is pegged 1:1 to winter. There is no spring scenario. There has never been a spring scenario. This is by design. Buffalo winters are not a bug.",
    status: "STABLE \u2014 PERMANENTLY FROZEN",
  },
  {
    ticker: "$CASIMIR",
    name: "Concord Casimir Token",
    tagline: "The Pierogi-Backed Derivative",
    color: "#ff88ff",
    stats: [
      { label: "MARKET CAP", value: "12 PIEROGIES" },
      { label: "BACKING", value: "SOUR CREAM RESERVES" },
      { label: "SPECIES", value: "CAT" },
    ],
    note: "$CASIMIR is the only token backed by a cat eating pierogies. If Casimir eats the pierogi, the token mints. If he ignores it, the token burns. There is no technical analysis that applies to cat-based pierogi consumption. We have tried.",
    status: "EXOTIC DERIVATIVE \u2014 SPECIES MISMATCH",
  },
  {
    ticker: "$PHIL_DC",
    name: "Potomac Phil Token",
    tagline: "The Dead Token",
    color: "#666666",
    stats: [
      { label: "MARKET CAP", value: "$0.00 (TAXIDERMIED)" },
      { label: "HOLDERS", value: "THE SMITHSONIAN" },
      { label: "PREDICTION", value: "GRIDLOCK" },
    ],
    note: "The underlying asset is deceased. Potomac Phil is a stuffed, taxidermied groundhog who annually predicts political gridlock. The token was delisted after it was discovered the oracle was literally dead. Accuracy rate remains 100% because Washington is always gridlocked.",
    status: "DELISTED \u2014 ORACLE DECEASED",
  },
  {
    ticker: "$MEL",
    name: "Milltown Mel Token",
    tagline: "The Regulatory Casualty",
    color: "#444444",
    stats: [
      { label: "MARKET CAP", value: "VETOED" },
      { label: "REGULATORY STATUS", value: "BLOCKED BY GOVERNOR" },
      { label: "CAUSE OF DEATH", value: "NATURAL" },
    ],
    note: "The founding groundhog died before the 2022 ceremony. New Jersey rabies laws prohibited acquiring a replacement. A bill was introduced to create a regulatory exemption. The governor vetoed it. $MEL has been in regulatory limbo for 4 years. There is no succession plan.",
    status: "SUSPENDED \u2014 REGULATORY HELL",
  },
  {
    ticker: "$STUMP",
    name: "Stumptown Fil Token",
    tagline: "The Species Violation",
    color: "#00ff88",
    stats: [
      { label: "MARKET CAP", value: "2 LOGS" },
      { label: "ORACLE", value: "BEAVER" },
      { label: "METHOD", value: "TREAT SELECTION" },
    ],
    note: "$STUMP is backed by a beaver in Portland, Oregon. The oracle makes predictions by choosing between two treats placed on logs. Regulatory authorities have flagged a species mismatch \u2014 beavers are not groundhogs. Portland does not care.",
    status: "UNREGULATED \u2014 SPECIES VIOLATION",
  },
];

const TICKER_ITEMS = [
  { ticker: "$CHUCK", value: "-99.9%", color: "#ff4444" },
  { ticker: "$BERT", value: "0.00% (FROZEN)", color: "#4488ff" },
  { ticker: "$CASIMIR", value: "+PIEROGI%", color: "#ff88ff" },
  { ticker: "$PHIL_DC", value: "DELISTED (DECEASED)", color: "#666666" },
  { ticker: "$MEL", value: "SUSPENDED (RIP)", color: "#444444" },
  { ticker: "$STUMP", value: "2 LOGS", color: "#00ff88" },
];

const SUMMARY = [
  { label: "TOTAL RIVAL MARKET CAP", value: "NEGLIGIBLE" },
  { label: "ORACLES WITH A PULSE", value: "4 OF 6" },
  { label: "SPECIES COMPLIANCE", value: "50%" },
  { label: "INNER CIRCLE RECOGNITION", value: "0%" },
];

export default function RivalsPage() {
  const tickerContent = TICKER_ITEMS.map(
    (t) => `${t.ticker} ${t.value}`
  ).join("  \u00b7  ");

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg)", paddingTop: 36 }}
    >
      {/* ── Header ── */}
      <header className="pt-12 pb-8 px-6 text-center">
        <Link
          href="/"
          className="inline-block text-xs font-[family-name:var(--font-mono)] mb-8 transition-colors hover:opacity-80"
          style={{ color: "var(--muted)" }}
        >
          &lt; RETURN TO HEADQUARTERS
        </Link>

        <p
          className="text-xs font-[family-name:var(--font-mono)] tracking-[0.3em] uppercase mb-3"
          style={{ color: "var(--amber)" }}
        >
          Groundhoge Day Economic Authority
        </p>
        <h1
          className="font-[family-name:var(--font-serif)] text-4xl md:text-5xl font-bold mb-4"
          style={{ color: "var(--text)" }}
        >
          Rival Token Intelligence
        </h1>
        <p
          className="text-sm font-[family-name:var(--font-mono)]"
          style={{ color: "var(--muted)" }}
        >
          COMPETITIVE ANALYSIS &mdash; THREAT LEVEL: NEGLIGIBLE
        </p>
      </header>

      {/* ── Fake Ticker Bar ── */}
      <div
        className="overflow-hidden"
        style={{
          borderTop: "1px solid var(--card-border)",
          borderBottom: "1px solid var(--card-border)",
          background: "rgba(255,170,0,0.03)",
        }}
      >
        <div
          className="rival-ticker flex items-center whitespace-nowrap text-xs font-[family-name:var(--font-mono)] py-2.5"
          style={{ color: "var(--amber)" }}
        >
          <span className="px-6">
            {TICKER_ITEMS.map((t, i) => (
              <span key={t.ticker}>
                <span style={{ color: t.color }}>{t.ticker}</span>{" "}
                <span style={{ color: t.color, opacity: 0.8 }}>{t.value}</span>
                {i < TICKER_ITEMS.length - 1 && (
                  <span style={{ color: "var(--muted)" }}> &nbsp;|&nbsp; </span>
                )}
              </span>
            ))}
          </span>
          <span className="px-6">
            {TICKER_ITEMS.map((t, i) => (
              <span key={`dup-${t.ticker}`}>
                <span style={{ color: t.color }}>{t.ticker}</span>{" "}
                <span style={{ color: t.color, opacity: 0.8 }}>{t.value}</span>
                {i < TICKER_ITEMS.length - 1 && (
                  <span style={{ color: "var(--muted)" }}> &nbsp;|&nbsp; </span>
                )}
              </span>
            ))}
          </span>
        </div>

        <style jsx>{`
          .rival-ticker {
            animation: rival-scroll 25s linear infinite;
            width: max-content;
          }
          @keyframes rival-scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>

      {/* ── Rival Cards ── */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {RIVALS.map((rival) => (
          <div
            key={rival.ticker}
            className="rounded-lg overflow-hidden"
            style={{
              background: "#0a0a14",
              borderLeft: `4px solid ${rival.color}`,
              border: `1px solid var(--card-border)`,
              borderLeftWidth: 4,
              borderLeftColor: rival.color,
            }}
          >
            {/* Card Header */}
            <div
              className="px-6 py-4 flex flex-wrap items-baseline gap-x-4 gap-y-1"
              style={{ borderBottom: "1px solid var(--card-border)" }}
            >
              <span
                className="text-xl font-[family-name:var(--font-mono)] font-bold"
                style={{ color: rival.color }}
              >
                {rival.ticker}
              </span>
              <span
                className="text-sm font-[family-name:var(--font-mono)]"
                style={{ color: "var(--text)" }}
              >
                {rival.name}
              </span>
              <span
                className="text-xs font-[family-name:var(--font-mono)] italic"
                style={{ color: "var(--muted)" }}
              >
                &ldquo;{rival.tagline}&rdquo;
              </span>
            </div>

            {/* Stats Grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-px"
              style={{ background: "var(--card-border)" }}
            >
              {rival.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="px-6 py-3"
                  style={{ background: "#0a0a14" }}
                >
                  <div
                    className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-1"
                    style={{ color: "var(--muted)" }}
                  >
                    {stat.label}
                  </div>
                  <div
                    className="text-sm font-[family-name:var(--font-mono)] font-bold"
                    style={{ color: rival.color }}
                  >
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Analyst Note */}
            <div className="px-6 py-4">
              <div
                className="text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wider mb-2"
                style={{ color: "var(--amber)" }}
              >
                Analyst Note
              </div>
              <p
                className="text-sm font-[family-name:var(--font-mono)] leading-relaxed"
                style={{ color: "var(--text)", opacity: 0.85 }}
              >
                {rival.note}
              </p>
            </div>

            {/* Status Badge */}
            <div
              className="px-6 py-3 flex items-center gap-2"
              style={{
                borderTop: "1px solid var(--card-border)",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background: rival.color,
                  boxShadow: `0 0 6px ${rival.color}`,
                }}
              />
              <span
                className="text-xs font-[family-name:var(--font-mono)] font-bold tracking-wider"
                style={{ color: rival.color }}
              >
                {rival.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Market Summary ── */}
      <div
        className="max-w-4xl mx-auto px-6 pb-16"
      >
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "#0a0a14",
            border: "1px solid var(--card-border)",
          }}
        >
          {/* Summary Header */}
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid var(--card-border)" }}
          >
            <h2
              className="text-sm font-[family-name:var(--font-mono)] font-bold tracking-[0.2em] uppercase"
              style={{ color: "var(--amber)" }}
            >
              Market Summary
            </h2>
          </div>

          {/* Summary Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-px"
            style={{ background: "var(--card-border)" }}
          >
            {SUMMARY.map((row) => (
              <div
                key={row.label}
                className="px-6 py-4 flex justify-between items-center"
                style={{ background: "#0a0a14" }}
              >
                <span
                  className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-wider"
                  style={{ color: "var(--muted)" }}
                >
                  {row.label}
                </span>
                <span
                  className="text-sm font-[family-name:var(--font-mono)] font-bold"
                  style={{ color: "var(--green)" }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Closing Line */}
          <div
            className="px-6 py-5"
            style={{
              borderTop: "1px solid var(--card-border)",
              background: "rgba(255,170,0,0.02)",
            }}
          >
            <p
              className="text-xs font-[family-name:var(--font-mono)] leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              The Groundhoge Day Economic Authority does not recognize any rival
              token.{" "}
              <span style={{ color: "var(--amber)" }}>$HOGE</span> remains the
              sole weather-dependent deflationary asset. This is not financial
              advice. This is shadow advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
