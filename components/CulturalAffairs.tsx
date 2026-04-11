"use client";

import { useInView } from "@/hooks/useInView";

type BorderColor = "amber" | "blue" | "red" | "green";

interface IntelReport {
  title: string;
  borderColor: BorderColor;
  content: (string | { type: "table"; rows: string[][] } | { type: "bullets"; items: string[] } | { type: "derivatives"; label: string; text: string })[];
  filed: string;
}

const borderColors: Record<BorderColor, string> = {
  amber: "#ffaa00",
  blue: "#4488ff",
  red: "#ff4444",
  green: "#00ff88",
};

const reports: IntelReport[] = [
  {
    title: "THE 1993 INCIDENT",
    borderColor: "amber",
    content: [
      "In 1993, Columbia Pictures released a classified cultural artifact depicting a meteorologist trapped in a temporal anomaly on February 2nd in Punxsutawney, Pennsylvania.",
      "PRODUCTION INTEL: Despite being set in Punxsutawney, the production was filmed entirely in Woodstock, Illinois. The real Punxsutawney was deemed 'too isolated' and 'lacking adequate town square infrastructure.'",
      "CASTING ALTERNATIVES CONSIDERED: Tom Hanks, Chevy Chase, Michael Keaton. Subject Murray was selected. The subject has not commented on the temporal implications.",
      "BIOLOGICAL INCIDENT: During production, the groundhog (codename: SCOOTER) bit Subject Murray on the knuckle twice, drawing blood through protective gloves. Subject Murray completed filming.",
    ],
    filed: "1993-02-02",
  },
  {
    title: "TEMPORAL LOOP DURATION ESTIMATES",
    borderColor: "blue",
    content: [
      "The exact duration of the depicted temporal anomaly remains classified. Multiple intelligence estimates exist:",
      {
        type: "table",
        rows: [
          ["INITIAL ASSESSMENT (Director)", "~10 years"],
          ["REVISED ASSESSMENT (Director, 2006)", "30-40 years"],
          ["ORIGINAL DRAFT ESTIMATE", "70-80 years (book-reading tracking method)"],
          ["10,000-HOUR RULE ANALYSIS", "~12,400 days (33.9 years) — calculated from observed skill acquisition"],
        ],
      },
      "The subject demonstrated fluency in French, mastery of ice sculpture, advanced piano performance, and comprehensive knowledge of every resident's daily schedule. These competencies are consistent with the 30-40 year estimate.",
    ],
    filed: "REDACTED",
  },
  {
    title: "COLLATERAL DAMAGE",
    borderColor: "red",
    content: [
      "The production caused significant interpersonal damage between Subject Murray and Director Ramis. The two had previously collaborated on three major classified operations (1980, 1981, 1984).",
      "INCIDENT: Creative disagreements during production escalated to non-communication. Subject Murray sought a philosophical production. Director Ramis maintained romantic comedy parameters.",
      "RESOLUTION TIMELINE: Approximately 20 years of silence. Communication resumed only in the final months before Director Ramis's passing in 2014.",
      "CLASSIFICATION: The cultural artifact was subsequently added to the Library of Congress National Film Registry (2006). Its significance is no longer disputed.",
    ],
    filed: "2014-02-24",
  },
  {
    title: "LINGUISTIC CONTAMINATION",
    borderColor: "green",
    content: [
      "The 1993 incident permanently altered the English language. The phrase 'Groundhog Day' was weaponized by the general population to describe any repetitive, monotonous, or seemingly inescapable situation.",
      "EVIDENCE OF CONTAMINATION:",
      {
        type: "bullets",
        items: [
          "Major dictionaries now carry a secondary definition: 'a situation in which events are or appear to be continually repeated'",
          "Political deployment: The phrase has been deployed by heads of state, including during the 1996 U.S. presidential campaign",
          "Pandemic usage: During the COVID-19 lockdowns, the phrase experienced a 4,000% usage spike as populations experienced actual temporal loop conditions",
          "The website TV Tropes officially classifies the time loop narrative device as the 'Groundhog Day Loop' \u2014 47+ derivative works catalogued across film, television, and interactive media",
        ],
      },
      {
        type: "derivatives",
        label: "DERIVATIVE WORKS INCLUDE",
        text: "Source Code (2011), Edge of Tomorrow (2014), Happy Death Day (2017), Palm Springs (2020), Russian Doll (series)",
      },
    ],
    filed: "1993-02-02",
  },
  {
    title: "SPIRITUAL ASSESSMENT",
    borderColor: "amber",
    content: [
      "Multiple religious and philosophical traditions have independently claimed the 1993 production as a spiritual text:",
      {
        type: "table",
        rows: [
          ["BUDDHIST INTERPRETATION", "Reincarnation allegory \u2014 the cycle of suffering and enlightenment"],
          ["CHRISTIAN INTERPRETATION", "Purgatory narrative \u2014 redemption through moral transformation"],
          ["JEWISH INTERPRETATION", "Teshuvah (repentance) \u2014 performing moral deeds to break destructive patterns"],
          ["PSYCHIATRIC APPLICATION", "Recommended to patients by mental health professionals. Used by addiction recovery programs as a metaphor for breaking repetitive cycles."],
        ],
      },
      "TOURISM IMPACT: Annual attendance at the Punxsutawney festival increased from ~2,000 to 35,000+ following the cultural event's release.",
    ],
    filed: "1993-02-02",
  },
];

export default function CulturalAffairs() {
  const [ref, isInView] = useInView();

  return (
    <section
      ref={ref}
      id="cultural-affairs"
      className={`py-24 max-w-6xl mx-auto px-6 fade-in-section ${isInView ? "is-visible" : ""}`}
    >
      {/* Section header */}
      <div className="text-center mb-16">
        <h2
          className="text-sm md:text-base tracking-widest uppercase mb-4"
          style={{ fontFamily: "var(--font-serif)", color: "#666666" }}
        >
          Department of Cultural Affairs
        </h2>
        <p
          className="text-sm md:text-xl lg:text-2xl tracking-widest uppercase"
          style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
        >
          Cultural Impact Assessment &mdash; Classified Briefing
        </p>
      </div>

      {/* Report cards */}
      <div className="space-y-6">
        {reports.map((report, i) => {
          const color = borderColors[report.borderColor];

          return (
            <div
              key={i}
              className="relative rounded-lg p-6 md:p-8"
              style={{
                background: "#060610",
                borderLeft: `4px solid ${color}`,
                border: `1px solid #1a1a2e`,
                borderLeftWidth: "4px",
                borderLeftColor: color,
              }}
            >
              {/* Report header */}
              <h3 className="mb-5">
                <span
                  className="text-xs tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
                >
                  Intelligence Report:{" "}
                </span>
                <span
                  className="text-lg md:text-xl"
                  style={{ fontFamily: "var(--font-serif)", color: "#e8e6e3" }}
                >
                  {report.title}
                </span>
              </h3>

              {/* Report body */}
              <div className="space-y-4">
                {report.content.map((block, j) => {
                  if (typeof block === "string") {
                    return (
                      <p
                        key={j}
                        className="text-sm leading-relaxed"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "#999999",
                        }}
                      >
                        {block}
                      </p>
                    );
                  }

                  if (block.type === "table") {
                    return (
                      <div
                        key={j}
                        className="rounded overflow-hidden"
                        style={{ border: "1px solid #1a1a2e" }}
                      >
                        {/* Table header */}
                        <div
                          className="grid grid-cols-2 gap-4 px-4 py-2"
                          style={{ background: "rgba(255,255,255,0.02)" }}
                        >
                          <span
                            className="text-[10px] tracking-widest uppercase"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "#666666",
                            }}
                          >
                            Assessment
                          </span>
                          <span
                            className="text-[10px] tracking-widest uppercase"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "#666666",
                            }}
                          >
                            Duration
                          </span>
                        </div>
                        {/* Table rows */}
                        {block.rows.map((row, k) => (
                          <div
                            key={k}
                            className="grid grid-cols-2 gap-4 px-4 py-3"
                            style={{
                              borderTop: "1px solid #1a1a2e",
                            }}
                          >
                            <span
                              className="text-xs"
                              style={{
                                fontFamily: "var(--font-mono)",
                                color: "#e8e6e3",
                              }}
                            >
                              {row[0]}
                            </span>
                            <span
                              className="text-xs"
                              style={{
                                fontFamily: "var(--font-mono)",
                                color: "#999999",
                              }}
                            >
                              {row[1]}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (block.type === "bullets") {
                    return (
                      <ul key={j} className="space-y-3 pl-1">
                        {block.items.map((item, k) => (
                          <li
                            key={k}
                            className="text-sm leading-relaxed flex gap-2"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "#999999",
                            }}
                          >
                            <span style={{ color: "#666666" }}>&gt;</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  if (block.type === "derivatives") {
                    return (
                      <p
                        key={j}
                        className="text-sm leading-relaxed"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "#999999",
                        }}
                      >
                        <span style={{ color: "#e8e6e3" }}>
                          {block.label}:
                        </span>{" "}
                        {block.text}
                      </p>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Filed date stamp */}
              <div className="mt-6 text-right">
                <span
                  className="text-[10px] tracking-widest uppercase"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "#666666",
                  }}
                >
                  Filed: {report.filed}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
