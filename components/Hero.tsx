"use client";

import Image from "next/image";
import CountdownClock from "./CountdownClock";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4" style={{ paddingTop: 76 }}>
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
        <Image
          src="/logo-hoge.jpg"
          alt="Groundhoge Day — $HOGE Coin"
          width={420}
          height={420}
          priority
          className="w-64 h-64 md:w-96 md:h-96 rounded-full"
          style={{
            filter: "drop-shadow(0 0 40px rgba(255,170,0,0.25))",
          }}
        />

        {/* Visually hidden h1 for SEO */}
        <h1 className="sr-only">Groundhoge Day — $HOGE</h1>

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
          className="flex flex-wrap justify-center items-center gap-2 text-xs md:text-sm"
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
          <span className="mx-1 hidden md:inline">&middot;</span>
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
