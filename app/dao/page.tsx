import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DeSci Immortality Grant — Groundhoge Day Economic Authority",
  description:
    "The DeSci Division funds cutting-edge research into marmot longevity. The Oracle has survived since 1887. Science will ensure he survives 140 more.",
};

/* ── Status badges ── */
type BadgeVariant = "funded" | "review" | "rejected" | "complete" | "classified";

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  funded:     { bg: "rgba(0,255,136,0.08)", text: "#00ff88", border: "#00ff88" },
  review:     { bg: "rgba(255,170,0,0.08)", text: "#ffaa00", border: "#ffaa00" },
  rejected:   { bg: "rgba(255,60,60,0.08)", text: "#ff3c3c", border: "#ff3c3c" },
  complete:   { bg: "rgba(68,136,255,0.08)", text: "#4488ff", border: "#4488ff" },
  classified: { bg: "rgba(255,60,60,0.04)", text: "#ff3c3c", border: "#331111" },
};

function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const s = BADGE_STYLES[variant];
  return (
    <span
      className="font-mono text-xs tracking-widest px-3 py-1 rounded-sm inline-block"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {label}
    </span>
  );
}

/* ── Proposal data ── */
const PROPOSALS = [
  {
    id: "001",
    title: "Elixir Formula Optimization",
    status: "FUNDED — IN PROGRESS" as const,
    variant: "funded" as BadgeVariant,
    borderColor: "#00ff88",
    votes: { for: "1,883", against: "0", abstain: "Phil" },
    budget: "250,000 $HOGE",
    abstract:
      "Current Elixir formulation has remained unchanged since 1887. This proposal funds a systematic study of alternative vodka-to-milk ratios, egg freshness parameters, and orange juice concentration levels. Preliminary results suggest that premium vodka increases efficacy by 12%. The Oracle has refused to participate in taste tests.",
    pi: "Dr. Marmota, Bureau of Biological Research",
  },
  {
    id: "002",
    title: "Cryogenic Burrow Technology",
    status: "UNDER REVIEW" as const,
    variant: "review" as BadgeVariant,
    borderColor: "#ffaa00",
    votes: { for: "1,200", against: "683", abstain: "Phil" },
    budget: "500,000 $HOGE",
    abstract:
      "The Oracle currently hibernates in a climate-controlled habitat at the Punxsutawney Memorial Library. This proposal investigates cryogenic burrow technology that would allow the Oracle to achieve core temperatures below his current 35\u00b0F minimum, potentially extending hibernation cycles and reducing metabolic wear. Opponents argue this would delay the February 2 ceremony.",
    pi: "Dr. Cryos, Division of Hibernation Engineering",
  },
  {
    id: "003",
    title: "Groundhogese Neural Translation",
    status: "REJECTED — SECURITY RISK" as const,
    variant: "rejected" as BadgeVariant,
    borderColor: "#ff3c3c",
    votes: { for: "42", against: "1,841", abstain: "Phil" },
    budget: "1,000,000 $HOGE",
    abstract:
      "This proposal sought to develop an AI neural network capable of translating Groundhogese without the acacia cane. The Inner Circle voted overwhelmingly against, citing \u2018unacceptable security implications\u2019 and \u2018the democratization of Groundhogese interpretation would undermine the institutional authority of the presidency.\u2019 The proposal was classified and sealed.",
    pi: "REDACTED",
  },
  {
    id: "004",
    title: "Dental Regeneration Protocol",
    status: "FUNDED — COMPLETE" as const,
    variant: "complete" as BadgeVariant,
    borderColor: "#4488ff",
    votes: { for: "1,883", against: "0", abstain: "Phil" },
    budget: "75,000 $HOGE",
    abstract:
      "The Oracle\u2019s ivory-white incisors grow at 1.5mm per week. This grant funded research into optimizing dental growth rates for maximum defensive capability. Results: current growth rate is optimal. Weaponization potential remains CLASSIFIED. The Bureau of Biological Research notes that the Oracle has bitten multiple public officials and the current dental armament is \u2018more than sufficient.\u2019",
    pi: "Dr. Incisor, Bureau of Biological Research",
  },
  {
    id: "005",
    title: "Offspring Genetic Analysis",
    status: "CLASSIFIED" as const,
    variant: "classified" as BadgeVariant,
    borderColor: "#331111",
    votes: null,
    budget: "CLASSIFIED",
    abstract:
      "Following the 2024 succession crisis, this grant was established to determine whether the Oracle\u2019s offspring inherited any weather-predicting capabilities. The Inner Circle has classified all findings. The babies remain disowned. Access to this proposal requires Omega-level clearance.",
    pi: "CLASSIFIED",
  },
];

/* ── Page ── */
export default function DaoPage() {
  return (
    <main
      className="min-h-screen pt-24 pb-20 px-4"
      style={{ background: "#0a0a0f", color: "#e8e6e3" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="font-mono text-xs tracking-widest mb-8 inline-block transition-colors"
          style={{ color: "#666666" }}
          // hover handled inline below via group
        >
          <span className="hover:text-[#ffaa00] transition-colors">
            &lt; RETURN TO HEADQUARTERS
          </span>
        </Link>

        {/* ── HEADER ── */}
        <header className="mb-16 text-center">
          <p
            className="font-mono text-xs tracking-[0.3em] mb-4"
            style={{ color: "#ffaa00" }}
          >
            GROUNDHOGE DAY ECONOMIC AUTHORITY
          </p>
          <h1
            className="font-serif text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "#e8e6e3" }}
          >
            DeSci Immortality Grant
          </h1>
          <p
            className="font-mono text-xs tracking-[0.2em]"
            style={{ color: "#666666" }}
          >
            DECENTRALIZED SCIENCE DIVISION &mdash; MARMOT LONGEVITY RESEARCH
          </p>
        </header>

        {/* ── MISSION STATEMENT ── */}
        <section className="mb-16">
          <h2
            className="font-mono text-xs tracking-[0.2em] mb-6"
            style={{ color: "#ffaa00", borderBottom: "1px solid #1a1a2e", paddingBottom: 8 }}
          >
            MISSION STATEMENT
          </h2>
          <p className="leading-relaxed" style={{ color: "#e8e6e3", maxWidth: 720 }}>
            The Groundhoge Day Economic Authority&rsquo;s DeSci Division was established to ensure the
            Oracle&rsquo;s continued service to humanity. Current immortality protocols rely on the Elixir
            of Life &mdash; a compound of vodka, milk, eggs, and orange juice. While effective for the
            past 140 years, the Division recognizes the need for more rigorous scientific approaches to
            marmot longevity.
          </p>
        </section>

        {/* ── TREASURY ── */}
        <section className="mb-16">
          <div
            className="rounded-sm p-6 md:p-8"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,136,0.03) 0%, rgba(0,255,136,0.00) 100%)",
              border: "1px solid #1a1a2e",
              boxShadow: "0 0 40px rgba(0,255,136,0.04)",
            }}
          >
            <h2
              className="font-mono text-xs tracking-[0.2em] mb-8"
              style={{ color: "#ffaa00" }}
            >
              GRANT TREASURY
            </h2>

            {/* Balance */}
            <div className="mb-6">
              <p className="font-mono text-xs mb-1" style={{ color: "#666666" }}>
                BALANCE
              </p>
              <p
                className="font-mono text-3xl md:text-4xl font-bold"
                style={{
                  color: "#00ff88",
                  textShadow: "0 0 20px rgba(0,255,136,0.3)",
                }}
              >
                1,883,000.00 $HOGE
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div>
                <p className="font-mono text-xs mb-1" style={{ color: "#666666" }}>
                  ALLOCATED
                </p>
                <p className="font-mono text-lg" style={{ color: "#ffaa00" }}>
                  420,690.00 $HOGE
                </p>
              </div>
              <div>
                <p className="font-mono text-xs mb-1" style={{ color: "#666666" }}>
                  REMAINING
                </p>
                <p className="font-mono text-lg" style={{ color: "#e8e6e3" }}>
                  1,462,310.00 $HOGE
                </p>
              </div>
              <div>
                <p className="font-mono text-xs mb-1" style={{ color: "#666666" }}>
                  ELIXIR RESERVES
                </p>
                <p className="font-mono text-lg" style={{ color: "#00ff88" }}>
                  7 BARRELS{" "}
                  <span className="text-xs" style={{ color: "#666666" }}>
                    (SUFFICIENT)
                  </span>
                </p>
              </div>
            </div>

            {/* Donate button */}
            <Link
              href="/#swap"
              className="inline-block font-mono text-sm tracking-widest px-8 py-3 rounded-sm transition-all"
              style={{
                background: "rgba(255,170,0,0.1)",
                color: "#ffaa00",
                border: "1px solid #ffaa00",
              }}
            >
              DONATE TO SCIENCE
            </Link>
          </div>
        </section>

        {/* ── RESEARCH PROPOSALS ── */}
        <section className="mb-16">
          <h2
            className="font-mono text-xs tracking-[0.2em] mb-8"
            style={{ color: "#ffaa00", borderBottom: "1px solid #1a1a2e", paddingBottom: 8 }}
          >
            RESEARCH PROPOSALS
          </h2>

          <div className="flex flex-col gap-6">
            {PROPOSALS.map((p) => (
              <article
                key={p.id}
                className="rounded-sm p-6"
                style={{
                  background: "rgba(10,10,15,0.8)",
                  border: "1px solid #1a1a2e",
                  borderLeft: `3px solid ${p.borderColor}`,
                }}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h3 className="font-serif text-lg" style={{ color: "#e8e6e3" }}>
                    <span className="font-mono text-xs mr-2" style={{ color: "#666666" }}>
                      GRANT #{p.id}:
                    </span>
                    {p.title}
                  </h3>
                  <Badge label={p.status} variant={p.variant} />
                </div>

                {/* Votes */}
                <div className="mb-4">
                  {p.votes ? (
                    <div className="grid grid-cols-3 gap-4 max-w-xs">
                      <div>
                        <p className="font-mono text-xs" style={{ color: "#666666" }}>
                          FOR
                        </p>
                        <p className="font-mono text-sm" style={{ color: "#00ff88" }}>
                          {p.votes.for}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-xs" style={{ color: "#666666" }}>
                          AGAINST
                        </p>
                        <p className="font-mono text-sm" style={{ color: "#ff3c3c" }}>
                          {p.votes.against}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-xs" style={{ color: "#666666" }}>
                          ABSTAIN
                        </p>
                        <p className="font-mono text-sm" style={{ color: "#ffaa00" }}>
                          {p.votes.abstain}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="font-mono text-xs" style={{ color: "#ff3c3c" }}>
                      VOTES: CLASSIFIED
                    </p>
                  )}
                </div>

                {/* Budget */}
                <p className="font-mono text-xs mb-4" style={{ color: "#666666" }}>
                  BUDGET:{" "}
                  <span style={{ color: p.budget === "CLASSIFIED" ? "#ff3c3c" : "#e8e6e3" }}>
                    {p.budget}
                  </span>
                </p>

                {/* Abstract */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#e8e6e3" }}>
                  {p.abstract}
                </p>

                {/* PI */}
                <p className="font-mono text-xs" style={{ color: "#666666" }}>
                  PI:{" "}
                  <span
                    style={{
                      color: p.pi === "REDACTED" || p.pi === "CLASSIFIED" ? "#ff3c3c" : "#e8e6e3",
                    }}
                  >
                    {p.pi}
                  </span>
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── GOVERNANCE ── */}
        <section className="mb-16">
          <h2
            className="font-mono text-xs tracking-[0.2em] mb-6"
            style={{ color: "#ffaa00", borderBottom: "1px solid #1a1a2e", paddingBottom: 8 }}
          >
            VOTING PROTOCOL
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: "#e8e6e3", maxWidth: 720 }}>
            All $HOGE holders may vote on research proposals. One token = one vote. Inner Circle
            NFT holders receive standard voting weight. The Acacia Cane NFT holder receives 6&times;
            vote multiplier. The Oracle does not vote. The Oracle abstains from all governance. The
            Oracle&rsquo;s position on governance is: he is a groundhog.
          </p>
          <p
            className="font-mono text-sm"
            style={{ color: "#ffaa00" }}
          >
            QUORUM: 1,883 votes required{" "}
            <span style={{ color: "#666666" }}>(the Oracle&rsquo;s birth year)</span>
          </p>
        </section>

        {/* ── FOOTER ── */}
        <footer
          className="pt-8 text-center"
          style={{ borderTop: "1px solid #1a1a2e" }}
        >
          <p className="font-mono text-xs leading-relaxed" style={{ color: "#666666" }}>
            The DeSci Immortality Grant Division is a research arm of the Groundhoge Day Economic
            Authority. All research is conducted in accordance with applicable marmot ethics
            guidelines. No groundhogs were harmed in the drafting of these proposals. The Oracle was
            not consulted.
          </p>
        </footer>
      </div>
    </main>
  );
}
