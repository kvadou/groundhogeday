"use client";

import { useInView } from "@/hooks/useInView";

const BAR_DATA = [
  { label: "OCTOPUS PAUL (2010 World Cup)", pct: 85.7, color: "#00ff88" },
  { label: "COIN FLIP (THEORETICAL)", pct: 50.0, color: "#4488ff" },
  { label: "WEATHER APPS IN MARCH", pct: 47.0, color: "#4488ff" },
  { label: "THE ORACLE (PUNXSUTAWNEY)", pct: 39.0, color: "#ffaa00", highlight: true },
  { label: "FINANCIAL ANALYSTS (CNBC)", pct: 38.0, color: "#ff4444" },
  { label: "DART-THROWING CHIMPANZEE", pct: 33.3, color: "#ff4444" },
  { label: "MAGIC 8-BALL", pct: 25.0, color: "#ff4444" },
];

const STATS = [
  { label: "YEARS OF SERVICE", value: "140+", color: "#ffaa00" },
  { label: "TOTAL PREDICTIONS", value: "129", color: "#00ff88" },
  { label: "SHADOW CALLS", value: "109", color: "#4488ff" },
  { label: "NO-SHADOW CALLS", value: "20", color: "#00ff88" },
];

export default function AccuracyReport() {
  const [ref, isInView] = useInView(0.1);

  return (
    <section
      ref={ref}
      className={`py-24 max-w-6xl mx-auto px-6 fade-in-section ${isInView ? "is-visible" : ""}`}
      style={{ background: "#060610", borderTop: "1px solid #1a1a2e" }}
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2
          className="text-sm tracking-widest mb-3"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          THE ORACLE&apos;S ACCURACY REPORT
        </h2>
        <p
          className="text-xs tracking-wider"
          style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
        >
          INDEPENDENT ANALYSIS &mdash; GOBBLER&apos;S KNOB RESEARCH DIVISION
        </p>
      </div>

      {/* Confidence Index Banner */}
      <div
        className="border border-[#1a1a2e] rounded-lg p-10 mb-12 text-center"
        style={{ background: "#0a0a14" }}
      >
        <p
          className="text-xs tracking-widest mb-6 uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          INNER CIRCLE CONFIDENCE INDEX
        </p>
        <div
          className="text-8xl font-bold mb-4"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#00ff88",
            textShadow: "0 0 40px #00ff8844, 0 0 80px #00ff8822",
          }}
        >
          100%
        </div>
        <p
          className="text-xs max-w-lg mx-auto leading-relaxed"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          The Oracle&apos;s confidence in his own predictions remains at 100%.
          External data is irrelevant.
        </p>
      </div>

      {/* Comparative Analysis Chart */}
      <div
        className="border border-[#1a1a2e] rounded-lg p-8 mb-12"
        style={{ background: "#0a0a14" }}
      >
        <p
          className="text-xs tracking-widest mb-8 uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          COMPARATIVE ACCURACY ANALYSIS
        </p>
        <div className="space-y-4">
          {BAR_DATA.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-4"
              style={{
                fontFamily: "var(--font-mono)",
                padding: row.highlight ? "8px" : "4px 8px",
                borderRadius: row.highlight ? "6px" : undefined,
                border: row.highlight ? `1px solid ${row.color}44` : undefined,
                background: row.highlight ? `${row.color}08` : undefined,
                boxShadow: row.highlight ? `0 0 20px ${row.color}11` : undefined,
              }}
            >
              <span
                className="text-xs shrink-0 text-right"
                style={{
                  color: row.highlight ? row.color : "#e8e6e3",
                  width: "260px",
                  minWidth: "260px",
                  fontWeight: row.highlight ? 700 : 400,
                }}
              >
                {row.label}
              </span>
              <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: "#111122" }}>
                <div
                  className="h-full rounded"
                  style={{
                    width: isInView ? `${(row.pct / 100) * 100}%` : "0%",
                    background: `linear-gradient(90deg, ${row.color}cc, ${row.color})`,
                    boxShadow: `0 0 10px ${row.color}44`,
                    transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
                    transitionDelay: row.highlight ? "0.4s" : "0.2s",
                    height: row.highlight ? "24px" : "20px",
                    marginTop: row.highlight ? "-2px" : undefined,
                  }}
                />
              </div>
              <span
                className="text-xs shrink-0 w-14 text-right"
                style={{
                  color: row.color,
                  fontWeight: row.highlight ? 700 : 400,
                  textShadow: row.highlight ? `0 0 8px ${row.color}44` : undefined,
                }}
              >
                {row.pct.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Official Position Statement */}
      <div
        className="rounded-lg p-8 mb-12"
        style={{
          background: "#0a0a14",
          border: "1px solid #1a1a2e",
          borderTop: "3px solid #ffaa00",
        }}
      >
        <p
          className="text-xs tracking-widest mb-4 uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
        >
          INNER CIRCLE OFFICIAL POSITION
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: "var(--font-mono)", color: "#e8e6e3" }}
        >
          The Oracle maintains a 100% accuracy rate. Any discrepancy between the
          Oracle&apos;s forecast and observed meteorological conditions is
          attributable to translation error on the part of the presiding human
          interpreter. The Oracle communicates in Groundhogese, a language of
          considerable nuance. The acacia cane is old. Mistranslations are
          expected.
        </p>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="border border-[#1a1a2e] rounded-lg p-6 text-center"
            style={{ background: "#0a0a14" }}
          >
            <div
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{
                fontFamily: "var(--font-mono)",
                color: stat.color,
                textShadow: `0 0 12px ${stat.color}33`,
              }}
            >
              {stat.value}
            </div>
            <div
              className="text-xs tracking-widest uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p
        className="text-center text-xs leading-relaxed max-w-3xl mx-auto"
        style={{ fontFamily: "var(--font-mono)", color: "#444444" }}
      >
        This accuracy report was compiled by the Gobbler&apos;s Knob Research
        Division, which is funded entirely by the Inner Circle and has never
        found fault with the Oracle&apos;s methodology. Peer review requests
        have been denied on grounds of national security.
      </p>
    </section>
  );
}
