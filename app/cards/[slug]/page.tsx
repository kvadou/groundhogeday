import type { Metadata } from "next";
import Link from "next/link";
import { CARDS, getCard } from "@/lib/card-data";
import { notFound } from "next/navigation";

// ---------------------------------------------------------------------------
// Static generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return CARDS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) return {};
  return {
    title: `${card.title} -- Groundhoge Day`,
    description: card.subtitle,
  };
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const AMBER = "#ffaa00";
const GREEN = "#00ff88";
const BLUE = "#4488ff";
const RED = "#ff4444";
const MUTED = "#666666";
const TEXT = "#e8e6e3";
const DIM = "#444444";
const BG = "#0a0a0f";
const CARD_BG = "#0d0d16";
const PANEL_BG = "#0a0a14";
const BORDER = "#1a1a2e";

const mono = "var(--font-mono)";
const serif = "var(--font-serif)";

// Card wrapper: 1200x675 Twitter-optimal
function CardWrapper({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: string;
}) {
  return (
    <div
      style={{
        width: 1200,
        height: 675,
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: mono,
        color: TEXT,
      }}
    >
      {/* Subtle scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.008) 2px, rgba(255,255,255,0.008) 4px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "40px 56px 0 56px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {children}
      </div>

      {/* Footer watermark */}
      <div
        style={{
          padding: "16px 56px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${BORDER}`,
          position: "relative",
          zIndex: 2,
        }}
      >
        <span style={{ fontSize: 10, color: DIM, letterSpacing: "0.1em" }}>
          {footer}
        </span>
        <span
          style={{
            fontSize: 10,
            color: MUTED,
            letterSpacing: "0.15em",
            fontWeight: 700,
          }}
        >
          groundhogeday.com
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card 1: Accuracy Comparison
// ---------------------------------------------------------------------------

const ACCURACY_DATA = [
  { label: "OCTOPUS PAUL", pct: 85.7, color: GREEN },
  { label: "COIN FLIP", pct: 50.0, color: BLUE },
  { label: "WEATHER APPS", pct: 47.0, color: BLUE },
  { label: "THE ORACLE", pct: 39.0, color: AMBER, highlight: true },
  { label: "CNBC ANALYSTS", pct: 38.0, color: RED },
  { label: "DART-THROWING CHIMP", pct: 33.3, color: RED },
  { label: "MAGIC 8-BALL", pct: 25.0, color: RED },
];

function AccuracyComparisonCard() {
  return (
    <CardWrapper footer="Inner Circle Confidence: 100%">
      <h1
        style={{
          fontFamily: serif,
          fontSize: 14,
          letterSpacing: "0.25em",
          color: MUTED,
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        THE ORACLE&apos;S ACCURACY REPORT
      </h1>
      <p
        style={{
          fontSize: 10,
          color: AMBER,
          letterSpacing: "0.15em",
          marginBottom: 32,
        }}
      >
        COMPARATIVE ACCURACY ANALYSIS &mdash; GOBBLER&apos;S KNOB RESEARCH
        DIVISION
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ACCURACY_DATA.map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: row.highlight ? "8px 12px" : "2px 12px",
              borderRadius: 6,
              border: row.highlight ? `1px solid ${row.color}44` : "1px solid transparent",
              background: row.highlight ? `${row.color}08` : "transparent",
              boxShadow: row.highlight ? `0 0 24px ${row.color}11` : "none",
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: row.highlight ? row.color : TEXT,
                fontWeight: row.highlight ? 700 : 400,
                width: 200,
                minWidth: 200,
                textAlign: "right",
                letterSpacing: "0.05em",
              }}
            >
              {row.label}
            </span>
            <div
              style={{
                flex: 1,
                height: row.highlight ? 26 : 20,
                background: "#111122",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${row.pct}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${row.color}cc, ${row.color})`,
                  boxShadow: `0 0 10px ${row.color}44`,
                  borderRadius: 3,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: row.highlight ? 700 : 400,
                color: row.color,
                width: 60,
                textAlign: "right",
                textShadow: row.highlight ? `0 0 8px ${row.color}44` : "none",
              }}
            >
              {row.pct.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 10,
          color: DIM,
          marginTop: 24,
          lineHeight: 1.6,
          maxWidth: 700,
        }}
      >
        The Oracle maintains a 100% accuracy rate. Discrepancies are attributable
        to human translation error in Groundhogese.
      </p>
    </CardWrapper>
  );
}

// ---------------------------------------------------------------------------
// Card 2: Hibernation Vitals
// ---------------------------------------------------------------------------

interface VitalRow {
  label: string;
  active: string;
  hibernating: string;
  color: string;
  unit: string;
}

const VITALS: VitalRow[] = [
  { label: "CORE TEMP", active: "99", hibernating: "35", color: RED, unit: "\u00b0F" },
  { label: "HEART RATE", active: "80", hibernating: "4", color: GREEN, unit: "BPM" },
  { label: "RESPIRATION", active: "Normal", hibernating: "1 / 6min", color: BLUE, unit: "" },
  { label: "BODY MASS", active: "100%", hibernating: "-50%", color: AMBER, unit: "" },
];

function HibernationVitalsCard() {
  return (
    <CardWrapper footer="Bureau of Biological Research">
      <h1
        style={{
          fontFamily: serif,
          fontSize: 14,
          letterSpacing: "0.25em",
          color: MUTED,
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        HIBERNATION PROTOCOL
      </h1>
      <p
        style={{
          fontSize: 10,
          color: AMBER,
          letterSpacing: "0.15em",
          marginBottom: 36,
        }}
      >
        VITAL SIGN TELEMETRY &mdash; MARMOTA MONAX &mdash; CLEARANCE: OMEGA
      </p>

      {/* Vital sign rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr 80px 60px 80px",
            gap: 16,
            paddingBottom: 12,
            borderBottom: `1px solid ${BORDER}`,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 9, color: DIM, letterSpacing: "0.15em" }}>METRIC</span>
          <span />
          <span style={{ fontSize: 9, color: DIM, letterSpacing: "0.15em", textAlign: "center" }}>ACTIVE</span>
          <span />
          <span style={{ fontSize: 9, color: DIM, letterSpacing: "0.15em", textAlign: "center" }}>HIBERNATING</span>
        </div>

        {VITALS.map((v) => (
          <div
            key={v.label}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 80px 60px 80px",
              gap: 16,
              alignItems: "center",
              padding: "18px 0",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <span style={{ fontSize: 12, color: MUTED, letterSpacing: "0.1em", fontWeight: 600 }}>
              {v.label}
            </span>

            {/* Visual bar */}
            <div style={{ position: "relative", height: 8, background: "#111122", borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "100%",
                  background: `linear-gradient(90deg, ${v.color}22, ${v.color}88, ${v.color}22)`,
                  borderRadius: 4,
                }}
              />
              {/* Pulse dot */}
              <div
                style={{
                  position: "absolute",
                  right: 4,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: v.color,
                  boxShadow: `0 0 8px ${v.color}`,
                }}
              />
            </div>

            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: TEXT,
                textAlign: "center",
              }}
            >
              {v.active}
              <span style={{ fontSize: 10, color: MUTED }}>{v.unit}</span>
            </span>

            <span
              style={{
                fontSize: 16,
                color: DIM,
                textAlign: "center",
              }}
            >
              &rarr;
            </span>

            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: v.color,
                textAlign: "center",
                textShadow: `0 0 12px ${v.color}44`,
              }}
            >
              {v.hibernating}
              <span style={{ fontSize: 10, color: MUTED }}>{v.unit}</span>
            </span>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 10,
          color: DIM,
          marginTop: 24,
          lineHeight: 1.6,
        }}
      >
        True hibernation &mdash; not merely torpor. The subject&apos;s biology is
        classified as strategically significant by military researchers.
      </p>
    </CardWrapper>
  );
}

// ---------------------------------------------------------------------------
// Card 3: Animal Evolution Timeline
// ---------------------------------------------------------------------------

interface EraItem {
  animal: string;
  era: string;
  detail: string;
  color: string;
  penalty: string;
}

const ERAS: EraItem[] = [
  {
    animal: "BEAR",
    era: "Medieval Europe",
    detail: "If the bear saw its shadow on Candlemas, winter continued.",
    color: MUTED,
    penalty: "4 weeks",
  },
  {
    animal: "BADGER",
    era: "Germany, \"Dachstag\"",
    detail: "German settlers watched badgers emerge from burrows on Feb 2.",
    color: BLUE,
    penalty: "4 weeks",
  },
  {
    animal: "GROUNDHOG",
    era: "Pennsylvania, 1887",
    detail: "No badgers in Pennsylvania. The groundhog was promoted.",
    color: AMBER,
    penalty: "6 weeks",
  },
];

function AnimalEvolutionCard() {
  return (
    <CardWrapper footer="Bureau of Historical Research">
      <h1
        style={{
          fontFamily: serif,
          fontSize: 14,
          letterSpacing: "0.25em",
          color: MUTED,
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        WEATHER ORACLE SUCCESSION
      </h1>
      <p
        style={{
          fontSize: 10,
          color: AMBER,
          letterSpacing: "0.15em",
          marginBottom: 40,
        }}
      >
        ANIMAL-BASED WEATHER PREDICTION &mdash; A HISTORICAL TIMELINE
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 0,
          position: "relative",
        }}
      >
        {/* Connecting line */}
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 60,
            right: 60,
            height: 2,
            background: `linear-gradient(90deg, ${MUTED}44, ${BLUE}44, ${AMBER}44)`,
            zIndex: 0,
          }}
        />

        {ERAS.map((era, i) => (
          <div
            key={era.animal}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Circle node */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                border: `2px solid ${era.color}`,
                background: `${era.color}11`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                boxShadow: `0 0 20px ${era.color}22`,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: era.color,
                  letterSpacing: "0.1em",
                }}
              >
                {era.animal}
              </span>
            </div>

            {/* Arrow between nodes */}
            {i < ERAS.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 36,
                  right: -16,
                  fontSize: 18,
                  color: DIM,
                  zIndex: 2,
                }}
              >
                &rarr;
              </div>
            )}

            <span
              style={{
                fontSize: 10,
                color: era.color,
                letterSpacing: "0.1em",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {era.era}
            </span>
            <p
              style={{
                fontSize: 10,
                color: MUTED,
                textAlign: "center",
                lineHeight: 1.6,
                maxWidth: 280,
                marginBottom: 16,
              }}
            >
              {era.detail}
            </p>
            <div
              style={{
                background: PANEL_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                padding: "8px 16px",
              }}
            >
              <span style={{ fontSize: 9, color: DIM, letterSpacing: "0.1em" }}>
                WINTER PENALTY:{" "}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: era.color,
                  textShadow: `0 0 8px ${era.color}33`,
                }}
              >
                {era.penalty}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Unexplained increase callout */}
      <div
        style={{
          marginTop: 32,
          padding: "12px 20px",
          background: `${AMBER}08`,
          border: `1px solid ${AMBER}33`,
          borderRadius: 6,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 10, color: AMBER, letterSpacing: "0.1em" }}>
          ANOMALY DETECTED: Winter penalty increased from 4 weeks to 6 weeks
          upon groundhog succession. No explanation on file.
        </span>
      </div>
    </CardWrapper>
  );
}

// ---------------------------------------------------------------------------
// Card 4: Phil's Resume
// ---------------------------------------------------------------------------

interface ResumeRow {
  label: string;
  value: string;
  color: string;
}

const RESUME_ITEMS: ResumeRow[] = [
  { label: "YEARS OF SERVICE", value: "140+", color: AMBER },
  { label: "ACCURACY RATE", value: "39% (Inner Circle claims: 100%)", color: GREEN },
  { label: "LANGUAGES", value: "Groundhogese (fluent), English (none)", color: TEXT },
  { label: "SHADOW PREDICTIONS", value: "109", color: BLUE },
  { label: "NO-SHADOW PREDICTIONS", value: "20", color: GREEN },
  { label: "PUBLIC OFFICIALS BITTEN", value: "Multiple", color: RED },
  { label: "OFFSPRING", value: "2 (disowned)", color: TEXT },
  { label: "SECRET TO LONGEVITY", value: 'Groundhog Punch (vodka, milk, eggs, OJ)', color: AMBER },
];

function PhilResumeCard() {
  return (
    <CardWrapper footer="Groundhoge Day Economic Authority">
      <h1
        style={{
          fontFamily: serif,
          fontSize: 14,
          letterSpacing: "0.25em",
          color: MUTED,
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        CURRICULUM VITAE &mdash; THE ORACLE
      </h1>
      <p
        style={{
          fontSize: 10,
          color: AMBER,
          letterSpacing: "0.15em",
          marginBottom: 8,
        }}
      >
        PUNXSUTAWNEY PHIL &mdash; SEER OF SEERS, SAGE OF SAGES
      </p>
      <p
        style={{
          fontSize: 10,
          color: DIM,
          marginBottom: 32,
          lineHeight: 1.5,
        }}
      >
        Prognosticator of Prognosticators &mdash; Gobbler&apos;s Knob,
        Punxsutawney, PA
      </p>

      {/* Resume items */}
      <div
        style={{
          background: PANEL_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "4px 0",
        }}
      >
        {RESUME_ITEMS.map((item, i) => (
          <div
            key={item.label}
            style={{
              display: "grid",
              gridTemplateColumns: "240px 1fr",
              gap: 24,
              padding: "14px 28px",
              borderBottom: i < RESUME_ITEMS.length - 1 ? `1px solid ${BORDER}` : "none",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: MUTED,
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontSize: 12,
                color: item.color,
                fontWeight: 500,
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 10,
          color: DIM,
          marginTop: 20,
          lineHeight: 1.5,
          fontStyle: "italic",
        }}
      >
        References available upon request. The Oracle does not provide
        references.
      </p>
    </CardWrapper>
  );
}

// ---------------------------------------------------------------------------
// Card 5: Rival Oracles
// ---------------------------------------------------------------------------

interface RivalOracle {
  name: string;
  location: string;
  note: string;
  color: string;
}

const RIVALS: RivalOracle[] = [
  { name: "CHUCK", location: "New York City", note: "Bit Mayor Bloomberg. Replacement also bit someone.", color: RED },
  { name: "CHUCKLES", location: "Connecticut", note: "Arrest warrant issued for inaccurate prediction.", color: RED },
  { name: "BUFFALO BERT", location: "Buffalo, NY", note: "Rigged. Always sees shadow. Suspected union ties.", color: AMBER },
  { name: "POTOMAC PHIL", location: "Washington, DC", note: "Taxidermied. Predicts legislative gridlock.", color: BLUE },
  { name: "CASIMIR", location: "Cleveland, OH", note: "A cat. Eats pierogies. Unrelated to weather.", color: GREEN },
  { name: "STUMPTOWN FIL", location: "Portland, OR", note: "A beaver. Species mismatch flagged.", color: GREEN },
  { name: "MEL", location: "New Jersey", note: "Deceased. Governor vetoed proposed replacement.", color: MUTED },
];

function RivalOraclesCard() {
  return (
    <CardWrapper footer="The Oracle recognizes none of these">
      <h1
        style={{
          fontFamily: serif,
          fontSize: 14,
          letterSpacing: "0.25em",
          color: MUTED,
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        INTELLIGENCE BRIEFING: FALSE PROPHETS
      </h1>
      <p
        style={{
          fontSize: 10,
          color: RED,
          letterSpacing: "0.15em",
          marginBottom: 28,
        }}
      >
        KNOWN PRETENDERS &amp; UNAUTHORIZED WEATHER ORACLES &mdash; THREAT LEVEL:
        LOW
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {RIVALS.map((r) => (
          <div
            key={r.name}
            style={{
              background: PANEL_BG,
              border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${r.color}`,
              borderRadius: 6,
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: r.color,
                  letterSpacing: "0.08em",
                }}
              >
                {r.name}
              </span>
              <span style={{ fontSize: 9, color: DIM, letterSpacing: "0.08em" }}>
                {r.location}
              </span>
            </div>
            <p style={{ fontSize: 10, color: MUTED, lineHeight: 1.5 }}>
              {r.note}
            </p>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 10,
          color: DIM,
          marginTop: 16,
          lineHeight: 1.6,
          textAlign: "center",
        }}
      >
        All listed oracles operate without Inner Circle authorization.
        Predictions are non-binding.
      </p>
    </CardWrapper>
  );
}

// ---------------------------------------------------------------------------
// Card 6: Tokenomics Lore
// ---------------------------------------------------------------------------

interface LoreItem {
  number: string;
  meaning: string;
  color: string;
}

const LORE_LEFT: LoreItem[] = [
  { number: "1,883,000,000", meaning: "Total supply = Phil's birth year (1883)", color: AMBER },
  { number: "6% burn", meaning: "6 weeks of winter (shadow penalty)", color: RED },
  { number: "3.9% mint", meaning: "39% accuracy rate (no-shadow reward)", color: GREEN },
  { number: "1,883 daily limit", meaning: "Max daily sell = birth year", color: AMBER },
];

const LORE_RIGHT: LoreItem[] = [
  { number: "7:25 AM reset", meaning: "Sunrise on February 2nd, Punxsutawney", color: BLUE },
  { number: "42-day lockup", meaning: "6 weeks = hibernation period", color: BLUE },
  { number: "40% penalty", meaning: "Phil's lifetime accuracy rate", color: RED },
  { number: "109th tx trap", meaning: "109 shadow predictions (historical)", color: AMBER },
];

function TokenomicsLoreCard() {
  return (
    <CardWrapper footer="$HOGE on Solana">
      <h1
        style={{
          fontFamily: serif,
          fontSize: 14,
          letterSpacing: "0.25em",
          color: MUTED,
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        $HOGE &mdash; EVERY NUMBER IS LORE
      </h1>
      <p
        style={{
          fontSize: 10,
          color: AMBER,
          letterSpacing: "0.15em",
          marginBottom: 36,
        }}
      >
        TOKENOMICS ROOTED IN 140 YEARS OF GROUNDHOG HISTORY
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {LORE_LEFT.map((item) => (
            <LoreRow key={item.number} item={item} />
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {LORE_RIGHT.map((item) => (
            <LoreRow key={item.number} item={item} />
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          padding: "14px 24px",
          background: `${AMBER}08`,
          border: `1px solid ${AMBER}33`,
          borderRadius: 6,
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: 10, color: AMBER, letterSpacing: "0.08em", lineHeight: 1.6 }}>
          Every parameter in $HOGE maps to a real data point from Punxsutawney
          Phil&apos;s 140-year career. Nothing is arbitrary.
        </span>
      </div>
    </CardWrapper>
  );
}

function LoreRow({ item }: { item: LoreItem }) {
  return (
    <div
      style={{
        background: PANEL_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 6,
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: item.color,
          marginBottom: 6,
          letterSpacing: "0.02em",
          textShadow: `0 0 12px ${item.color}33`,
        }}
      >
        {item.number}
      </div>
      <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.5 }}>
        {item.meaning}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Slug-to-component map
// ---------------------------------------------------------------------------

const CARD_COMPONENTS: Record<string, () => React.ReactElement> = {
  "accuracy-comparison": AccuracyComparisonCard,
  "hibernation-vitals": HibernationVitalsCard,
  "animal-evolution": AnimalEvolutionCard,
  "phil-resume": PhilResumeCard,
  "rival-oracles": RivalOraclesCard,
  "tokenomics-lore": TokenomicsLoreCard,
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = getCard(slug);
  const CardComponent = CARD_COMPONENTS[slug];

  if (!card || !CardComponent) {
    notFound();
  }

  return (
    <main
      style={{
        background: BG,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      {/* Hint */}
      <p
        style={{
          fontFamily: mono,
          fontSize: 10,
          color: DIM,
          letterSpacing: "0.12em",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        SCREENSHOT THIS CARD &mdash; RIGHT-CLICK &rarr; SAVE IMAGE OR USE YOUR
        OS SCREENSHOT TOOL
      </p>

      {/* The card */}
      <CardComponent />

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          gap: 32,
          marginTop: 24,
          fontFamily: mono,
          fontSize: 11,
        }}
      >
        <Link
          href="/cards"
          style={{ color: MUTED, textDecoration: "none", letterSpacing: "0.1em" }}
        >
          &larr; ALL CARDS
        </Link>
        <Link
          href="/"
          style={{ color: DIM, textDecoration: "none", letterSpacing: "0.1em" }}
        >
          MAIN TERMINAL
        </Link>
      </div>
    </main>
  );
}
