"use client";

import CountdownClock from "./CountdownClock";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
      {/* Radial gradient behind countdown */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="w-[600px] h-[600px] md:w-[800px] md:h-[800px]"
          style={{
            background:
              "radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        {/* Logo */}
        <h1
          className="text-4xl md:text-5xl tracking-wider uppercase"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          GROUNDHOGE DAY
        </h1>

        {/* Token name */}
        <span
          className="text-lg -mt-4"
          style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
        >
          $HOGE
        </span>

        {/* Tagline */}
        <p
          className="text-xs md:text-sm tracking-[0.2em] max-w-xl"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          THE WORLD&apos;S FIRST WEATHER-DEPENDENT DEFLATIONARY ASSET
        </p>

        {/* Countdown */}
        <div className="mt-8 mb-8">
          <CountdownClock />
        </div>

        {/* Oracle status */}
        <div
          className="flex items-center gap-2 text-xs md:text-sm"
          style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
        >
          <span>Oracle status:</span>
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              backgroundColor: "#00ff88",
              boxShadow: "0 0 8px rgba(0,255,136,0.5)",
            }}
          />
          <span style={{ color: "#00ff88" }}>HIBERNATING</span>
          <span className="mx-1">&middot;</span>
          <span>Next emergence: February 2, 2027, 7:25 AM EST</span>
        </div>

        {/* CTA */}
        <button
          className="mt-8 px-8 py-3 text-xs tracking-widest uppercase transition-colors duration-300 cursor-pointer"
          style={{
            fontFamily: "var(--font-mono)",
            border: "1px solid #1a1a2e",
            background: "transparent",
            color: "var(--text)",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "#ffaa00";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.borderColor = "#1a1a2e";
          }}
          onClick={() => {
            document
              .getElementById("prophecy")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          READ THE PROPHECY
        </button>
      </div>
    </section>
  );
}
