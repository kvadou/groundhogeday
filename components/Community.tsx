"use client";

import Link from "next/link";
import { useInView } from "@/hooks/useInView";

export default function Community() {
  const [ref, isInView] = useInView();
  return (
    <section ref={ref} className={`py-24 max-w-6xl mx-auto px-6 fade-in-section ${isInView ? "is-visible" : ""}`}>
      <h2
        className="text-center tracking-[0.3em] text-sm text-[#666666] uppercase"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        DEPARTMENTS
      </h2>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {/* Card 1 — Bureau of Communications */}
        <div className="border border-[#1a1a2e] rounded p-8 hover:border-[#ffaa00]/30 transition-colors">
          <h3
            className="text-xs tracking-widest text-[#ffaa00] uppercase mb-6"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            BUREAU OF COMMUNICATIONS
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="text-sm text-[#e8e6e3] hover:text-[#ffaa00] transition-colors"
              >
                Official Dispatches (X)
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-[#e8e6e3] hover:text-[#ffaa00] transition-colors"
              >
                The Burrow (Telegram)
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-[#e8e6e3] hover:text-[#ffaa00] transition-colors"
              >
                Inner Circle Chambers (Discord)
              </a>
            </li>
          </ul>
        </div>

        {/* Card 2 — Division of Research */}
        <div className="border border-[#1a1a2e] rounded p-8 hover:border-[#ffaa00]/30 transition-colors">
          <h3
            className="text-xs tracking-widest text-[#ffaa00] uppercase mb-6"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            DIVISION OF RESEARCH
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="#prophecy"
                className="text-sm text-[#e8e6e3] hover:text-[#ffaa00] transition-colors"
              >
                The Prophecy
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-[#e8e6e3] hover:text-[#ffaa00] transition-colors"
              >
                Oracle Historical Database
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-[#e8e6e3] hover:text-[#ffaa00] transition-colors"
              >
                Contract Audit
              </a>
            </li>
          </ul>
        </div>

        {/* Card 3 — Office of Acquisitions */}
        <div className="border border-[#1a1a2e] rounded p-8 hover:border-[#ffaa00]/30 transition-colors">
          <h3
            className="text-xs tracking-widest text-[#ffaa00] uppercase mb-6"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            OFFICE OF ACQUISITIONS
          </h3>
          <ul className="space-y-3">
            <li>
              <a
                href="#"
                className="text-sm text-[#e8e6e3] hover:text-[#ffaa00] transition-colors"
              >
                Acquire $HOGE (Jupiter)
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-[#e8e6e3] hover:text-[#ffaa00] transition-colors"
              >
                Acquire $HOGE (Raydium)
              </a>
            </li>
            <li>
              <Link
                href="/hibernate"
                className="text-sm text-[#e8e6e3] hover:text-[#00ff88] transition-colors inline-flex items-center gap-2"
              >
                Hibernation Portal
                <span
                  className="text-[10px] border border-[#00ff88]/30 text-[#00ff88] px-2 py-0.5 rounded"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  ENTER THE BURROW
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
