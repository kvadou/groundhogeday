export default function Prophecy() {
  const shadowBullets = [
    "Circulating supply reduced by 6.00% via autonomous burn protocol",
    "Sell taxes elevated to simulate adverse winter market conditions",
    "Hibernation staking yields frozen at current rates",
    "Community advised to enter extended hibernation",
  ];

  const thawBullets = [
    "Supply expansion of 3.90% distributed pro-rata to all active wallets",
    "Liquidity pools thawed. Transaction friction reduced.",
    "Hibernation rewards enter 7x Elixir multiplier season",
    "The Burrow is open. Emergence protocol activated.",
  ];

  return (
    <section id="prophecy" className="py-24 max-w-6xl mx-auto px-6">
      {/* Classification header */}
      <div className="text-center">
        <span
          className="text-xs tracking-widest uppercase border-dashed border px-6 py-2 inline-block"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#ffaa00",
            borderColor: "rgba(255,170,0,0.3)",
          }}
        >
          CONFIDENTIAL — GOBBLER&apos;S KNOB ECONOMIC RESEARCH DIVISION
        </span>
      </div>

      {/* Two-column grid */}
      <div className="grid md:grid-cols-2 gap-8 mt-16">
        {/* Left card — Shadow Detected */}
        <div
          className="rounded-lg p-8"
          style={{
            background: "rgba(68,136,255,0.08)",
            borderTop: "2px solid #4488ff",
          }}
        >
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
          >
            SCENARIO A
          </span>
          <h3
            className="text-2xl text-white mt-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            ❄ SHADOW DETECTED
          </h3>
          <ul
            className="text-sm leading-relaxed mt-6 space-y-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {shadowBullets.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: "#666666" }}>&gt;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <span
              className="text-xs px-3 py-1 inline-block"
              style={{
                fontFamily: "var(--font-mono)",
                border: "1px solid rgba(68,136,255,0.5)",
                color: "#4488ff",
              }}
            >
              CRYPTO WINTER — SEVERE
            </span>
          </div>
        </div>

        {/* Right card — No Shadow Detected */}
        <div
          className="rounded-lg p-8"
          style={{
            background: "rgba(0,255,136,0.08)",
            borderTop: "2px solid #00ff88",
          }}
        >
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
          >
            SCENARIO B
          </span>
          <h3
            className="text-2xl text-white mt-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            ☀ NO SHADOW DETECTED
          </h3>
          <ul
            className="text-sm leading-relaxed mt-6 space-y-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {thawBullets.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span style={{ color: "#666666" }}>&gt;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <span
              className="text-xs px-3 py-1 inline-block"
              style={{
                fontFamily: "var(--font-mono)",
                border: "1px solid rgba(0,255,136,0.5)",
                color: "#00ff88",
              }}
            >
              ALTSEASON THAW — BULLISH
            </span>
          </div>
        </div>
      </div>

      {/* Oracle quote */}
      <div className="mt-16 text-center">
        <p
          className="text-lg italic"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          &ldquo;The Oracle&apos;s accuracy rate stands at 39%. Invest
          accordingly.&rdquo;
        </p>

        {/* Disclaimer */}
        <p
          className="mt-12 text-xs max-w-3xl mx-auto pt-8 leading-relaxed"
          style={{ color: "#666666", borderTop: "1px solid #1a1a2e" }}
        >
          Groundhoge Day ($HOGE) makes no representations regarding future
          meteorological events. Shadow-based tokenomics are determined by a
          rodent and should not be construed as financial advice. Past shadows do
          not guarantee future shadows.
        </p>
      </div>
    </section>
  );
}
