"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ─── Types ─── */
type TocEntry = { id: string; label: string };

const TOC: TocEntry[] = [
  { id: "origins", label: "Ancient Origins" },
  { id: "pennsylvania", label: "The Pennsylvania German Tradition" },
  { id: "inner-circle", label: "The Inner Circle" },
  { id: "accuracy", label: "The Oracle's Accuracy" },
  { id: "phil", label: "Phil — The Complete Biography" },
  { id: "species", label: "Species Dossier" },
  { id: "rivals", label: "The Rival Oracles" },
  { id: "1943", label: "The 1943 Interruption" },
  { id: "culture", label: "The 1993 Cultural Event" },
  { id: "timeline", label: "Timeline" },
];

/* ─── Rival Oracle data ─── */
const RIVALS = [
  {
    name: "Staten Island Chuck",
    location: "Staten Island, NY",
    color: "#4488ff",
    bio: `The East Coast's most notorious groundhog. In 2009, Chuck bit Mayor Michael Bloomberg on live television — drawing blood and cementing his reputation as the anti-establishment oracle. The incident became a dark omen when Mayor Bill de Blasio attended in 2014: he dropped Chuck's stand-in Charlotte, who died of internal injuries a week later. De Blasio quietly boycotted all future ceremonies. Chuck's actual accuracy rate hovers around 80%, making him statistically superior to Phil — a fact his handlers never tire of mentioning.`,
  },
  {
    name: "Chuckles",
    location: "Manchester, CT",
    color: "#ff4444",
    bio: `Known locally as "Chuck the Liar." After a particularly egregious failed prediction, the town of Manchester issued a formal arrest warrant for Chuckles — charging him with "deception of the public." The warrant, while tongue-in-cheek, was filed with the actual court clerk. Chuckles has never appeared to answer the charges.`,
  },
  {
    name: "Buffalo Bert",
    location: "Buffalo, NY",
    color: "#00ff88",
    bio: `The system is rigged and everyone knows it. Buffalo Bert's enclosure is designed so he always sees his shadow — guaranteeing six more weeks of winter every single year. His handlers claim "100% accuracy" with a straight face, arguing that in Buffalo, it's always winter anyway. He's technically correct, which is the best kind of correct.`,
  },
  {
    name: "Potomac Phil",
    location: "Washington, D.C.",
    color: "#ffaa00",
    bio: `The only taxidermied groundhog on the oracle circuit. Potomac Phil is literally a stuffed animal who "predicts" political gridlock every year — a prediction that, like Buffalo Bert's perpetual winter, has never once been wrong. His handlers position him facing the Capitol and interpret his glassy stare as "continued dysfunction." Accuracy rate: 100%.`,
  },
  {
    name: "Concord Casimir",
    location: "Concord, OH",
    color: "#ff88ff",
    bio: `Not a groundhog. Not even a rodent. Concord Casimir is a weather-predicting CAT who eats pierogies as part of his ceremony. His method: if he eats the pierogi, spring is coming. If he ignores it, six more weeks of winter. Casimir has been described as "the most honest oracle" because he makes no pretense of shadow-reading — he's just a cat who may or may not want a pierogi.`,
  },
  {
    name: "Stumptown Fil",
    location: "Portland, OR",
    color: "#88ddff",
    bio: `A beaver. Portland replaced the traditional groundhog with their state animal, a beaver named Fil (one L, to distinguish from Phil). Predictions are treat-based: two bowls are placed in front of Fil, one labeled "early spring" and one labeled "more winter." Whichever bowl Fil eats from first determines the forecast. The ceremony is held at the Oregon Zoo and involves significantly more flannel than the Punxsutawney version.`,
  },
  {
    name: "Birmingham Jill",
    location: "Birmingham, AL",
    color: "#ffcc44",
    bio: `An opossum who replaced the retired Birmingham Bill. The succession was controversial — purists argued that an opossum lacks the meteorological credibility of a groundhog. Jill's handlers counter that opossums are more resilient, more adaptable, and frankly more Southern. Jill predicts by choosing between two doors: one marked with a sun, one with a snowflake.`,
  },
  {
    name: "Milltown Mel",
    location: "Milltown, NJ",
    color: "#aaaaaa",
    bio: `The cautionary tale. Milltown Mel died just before the 2022 ceremony, and New Jersey's strict rabies quarantine laws prevented the town from acquiring a replacement groundhog in time. The town petitioned the governor for an emergency exemption. The governor vetoed the replacement bill. Milltown went without an oracle that year — the only community to lose their prognosticator to both death and bureaucracy in the same week.`,
  },
  {
    name: "Jimmy the Groundhog",
    location: "Sun Prairie, WI",
    color: "#ff6644",
    bio: `Achieved national fame in 2015 when he bit Mayor Jon Freund's ear during the live ceremony. The mayor, bleeding visibly, continued reading the proclamation. Jimmy's handlers later explained that the groundhog was "stressed by the crowd noise." Jimmy has since been retired from public ceremonies but continues to make predictions from the safety of his enclosure, communicated via press release.`,
  },
];

/* ─── Accuracy comparison data ─── */
const ACCURACY_DATA = [
  { label: "OCTOPUS PAUL (2010 World Cup)", pct: 85.7, color: "#00ff88" },
  { label: "COIN FLIP (THEORETICAL)", pct: 50.0, color: "#4488ff" },
  { label: "WEATHER APPS IN MARCH", pct: 47.0, color: "#4488ff" },
  { label: "THE ORACLE (PUNXSUTAWNEY)", pct: 39.0, color: "#ffaa00", highlight: true },
  { label: "FINANCIAL ANALYSTS (CNBC)", pct: 38.0, color: "#ff4444" },
  { label: "DART-THROWING CHIMPANZEE", pct: 33.3, color: "#ff4444" },
  { label: "MAGIC 8-BALL", pct: 25.0, color: "#ff4444" },
];

/* ─── Species identification data ─── */
const IDENTIFICATION = [
  { label: "SPECIES DESIGNATION:", value: "Marmota monax", color: "#e8e6e3" },
  { label: "COMMON ALIASES:", value: "Groundhog, Woodchuck, Whistle-pig, Land Beaver, Thickwood Badger", color: "#e8e6e3" },
  { label: "FRENCH-CANADIAN DESIGNATION:", value: "Siffleux", color: "#e8e6e3" },
  { label: "CODENAME:", value: "WHISTLE-PIG", color: "#00ff88", highlight: true },
  { label: "FAMILY:", value: "Sciuridae (Squirrel family \u2014 CLASSIFIED)", color: "#e8e6e3" },
  { label: "STATUS:", value: "NOT ENDANGERED \u2014 CONSIDERED ABUNDANT", color: "#00ff88" },
];

const VITAL_SIGNS = [
  { label: "CORE TEMPERATURE", value: "Drops from 99\u00b0F (37\u00b0C) to as low as 35\u00b0F (2\u00b0C)" },
  { label: "HEART RATE", value: "Drops from 80 BPM to 4\u201310 BPM" },
  { label: "RESPIRATION", value: "Drops to 1 breath every 6 minutes" },
  { label: "BODY MASS LOSS", value: "Approximately 50% by February" },
  { label: "DURATION", value: "October through February (varies by latitude)" },
];

const CAPABILITIES = [
  { label: "AQUATIC CAPABILITY:", text: "Confirmed. Subjects are accomplished swimmers." },
  { label: "ARBOREAL CAPABILITY:", text: "Confirmed. Subjects will climb trees to evade terrestrial threats." },
  { label: "EXCAVATION CAPABILITY:", text: "Extreme. A single burrow system can displace 35 cubic feet (1 cubic meter) of earth. Burrow networks include multiple chambers, exits, and a dedicated toilet room." },
  { label: "DENTAL ARMAMENT:", text: "Ivory-white incisors (unique among rodents \u2014 most rodent incisors are yellow). Growth rate: 1.5mm per week. Weaponization potential: CLASSIFIED." },
  { label: "DOCUMENTED ATTACKS:", text: "The subject has bitten multiple public officials including mayors and actors. See: Department of Cultural Affairs, Incident Report 1993." },
];

const ALIASES = [
  { region: "Pennsylvania German:", name: "Grundsow" },
  { region: "Appalachian:", name: "Whistle-pig" },
  { region: "Canadian French:", name: "Siffleux" },
  { region: "Scientific:", name: "Marmota monax" },
  { region: "Colonial American:", name: "Land beaver" },
  { region: "British colonial:", name: "Thickwood badger" },
  { region: "Inner Circle:", name: "The Oracle" },
  { region: "$HOGE Community:", name: "The Seer" },
];

/* ─── Timeline data ─── */
const TIMELINE = [
  { year: "1840", event: "First American diary reference — James L. Morris records Groundhog Day in Morgantown, PA" },
  { year: "1886", event: "First newspaper coverage in the Punxsutawney Spirit, edited by Clymer Freas" },
  { year: "1887", event: "First official ceremony at Gobbler's Knob, Punxsutawney, Pennsylvania" },
  { year: "1899", event: "Groundhog Club formally established to organize the annual Groundhog Feast" },
  { year: "1943", event: "Only cancellation in recorded history — WWII war clouds black out the shadow" },
  { year: "1961", event: "Phil receives his name — possibly after Prince Philip, Duke of Edinburgh" },
  { year: "1993", event: "Columbia Pictures immortalizes the day in American cinema — cultural inflection point" },
  { year: "2001", event: '"Seer of Seers, Sage of Sages, Prognosticator of Prognosticators" title officially conferred' },
  { year: "2006", event: "Library of Congress selects the 1993 film for preservation in the National Film Registry" },
  { year: "2024", event: "Phil sires two offspring with mate Phyllis — heirs immediately disowned by the Inner Circle" },
  { year: "2026", event: "$HOGE token launched — ancient prophecy meets on-chain economics" },
];

/* ─── Component ─── */
export default function LegendsContent() {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    for (const { id } of TOC) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", color: "#e8e6e3" }}>
      {/* ─── PAGE HEADER ─── */}
      <header className="relative border-b" style={{ borderColor: "#1a1a2e" }}>
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase transition-colors hover:text-white"
            style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
          >
            <span>&larr;</span> RETURN TO HEADQUARTERS
          </Link>

          <div className="mt-10">
            <p
              className="text-xs tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
            >
              Groundhoge Day Economic Authority
            </p>
            <h1
              className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Legends &amp; Lore
            </h1>
            <p
              className="text-sm tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
            >
              Complete Dossier &mdash; Clearance Level: Public
            </p>
          </div>

          {/* decorative line */}
          <div className="mt-8 h-px w-full" style={{ background: "linear-gradient(to right, #ffaa00, transparent)" }} />
        </div>
      </header>

      {/* ─── LAYOUT: SIDEBAR + CONTENT ─── */}
      <div className="max-w-6xl mx-auto px-6 py-12 lg:flex lg:gap-12">
        {/* ─── TABLE OF CONTENTS (sticky sidebar) ─── */}
        <nav className="lg:w-56 shrink-0 mb-12 lg:mb-0">
          <div className="lg:sticky lg:top-8">
            <p
              className="text-[10px] tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)", color: "#ffaa00" }}
            >
              Document Index
            </p>
            <ul className="space-y-1">
              {TOC.map((entry) => (
                <li key={entry.id}>
                  <a
                    href={`#${entry.id}`}
                    className="block py-1.5 px-3 text-xs tracking-wide uppercase rounded transition-all"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: activeSection === entry.id ? "#ffaa00" : "#666666",
                      background: activeSection === entry.id ? "rgba(255,170,0,0.08)" : "transparent",
                      borderLeft: activeSection === entry.id ? "2px solid #ffaa00" : "2px solid transparent",
                    }}
                  >
                    {entry.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 min-w-0">
          {/* ── SECTION 1: ANCIENT ORIGINS ── */}
          <Section id="origins" title="Ancient Origins" number="01">
            <P>
              The tradition of using an animal to predict the remaining duration of winter
              predates Christianity. At its root lies <Strong>Imbolc</Strong>, the Celtic
              festival marking the midpoint between winter solstice and spring equinox —
              February 1st in the old calendar. The Celts watched for serpents and hedgehogs
              emerging from their burrows. If the day was bright enough to cast a shadow,
              winter would persist.
            </P>
            <P>
              When Christianity absorbed pagan festivals, Imbolc became <Strong>Candlemas</Strong> (February 2nd) —
              the Feast of the Purification of the Virgin Mary. An old English rhyme
              encodes the meteorological rule:
            </P>
            <Blockquote>
              If Candlemas be fair and bright,<br />
              Come, Winter, have another flight;<br />
              If Candlemas brings clouds and rain,<br />
              Go, Winter, and come not again.
            </Blockquote>
            <P>
              In German-speaking regions, the tradition crystallized into <Strong>Dachstag</Strong> — Badger Day.
              Germans watched the <em>Dachs</em> (European badger) for shadow behavior on
              February 2nd. The logic was identical: shadow means extended winter, no shadow
              means early spring. The animal varied by geography — in the Alps, some communities
              used bears. Croatian and Serbian traditions held that if a bear saw its shadow on
              Candlemas, it would retreat to sleep for 40 more days.
            </P>
            <P>
              Irish and Scottish variants substituted the hedgehog or monitored whether
              serpents emerged on <Strong>St. Brigid&apos;s Day</Strong> (February 1st). A Scottish Gaelic
              proverb warns: &ldquo;The serpent will come from the hole on the brown Day of
              Brigid, though there should be three feet of snow on the flat surface of the
              ground.&rdquo;
            </P>
            <P>
              The animal evolution tells the story of migration: <Strong>bear &rarr; badger &rarr; groundhog</Strong>.
              When German settlers arrived in Pennsylvania, they found no European badgers —
              but plenty of woodchucks. The <em>Marmota monax</em> inherited a prophecy
              that had traveled thousands of miles and thousands of years.
            </P>
          </Section>

          {/* ── SECTION 2: PENNSYLVANIA GERMAN TRADITION ── */}
          <Section id="pennsylvania" title="The Pennsylvania German Tradition" number="02">
            <P>
              The German immigrants who settled in southeastern Pennsylvania in the 18th and
              19th centuries brought Dachstag with them — and adapted it to their new world.
              The groundhog replaced the badger. The social infrastructure followed.
            </P>
            <P>
              <Strong>The Grundsow Lodges</Strong> are perhaps the most remarkable piece of
              this tradition. These Pennsylvania German social clubs, still active today,
              hold annual Groundhog Day celebrations where <em>only Pennsylvania German
              (Deitsch) may be spoken</em>. Members are fined a nickel for every English
              word uttered. The lodges serve as cultural preservation societies, maintaining
              a dialect that is otherwise dying.
            </P>
            <P>
              The American version introduced a crucial mutation: in Germany, the badger&apos;s
              shadow meant <Strong>four more weeks</Strong> of winter. In America, the
              groundhog&apos;s shadow means <Strong>six more weeks</Strong>. No one knows
              exactly when or why the two extra weeks were added. Some historians speculate
              it reflects the harsher Pennsylvania winters; others suspect it was simply a
              more dramatic number.
            </P>
            <P>
              The first documented American reference appears in the diary of <Strong>James L.
              Morris</Strong> of Morgantown, Pennsylvania, on February 2, 1840:
            </P>
            <Blockquote>
              Last Tuesday, the 2nd, was Candlemas day, the day on which, according to the
              Germans, the Groundhog peeps out of his winter quarters and if he sees his
              shadow he pops back for another six weeks nap, but if the day be cloudy he
              remains out, as the weather is to be moderate.
            </Blockquote>
            <P>
              The tradition took a darker turn in Punxsutawney. In the 1880s, the
              local <Strong>Elks Lodge</Strong> began hosting an annual groundhog <em>hunt</em>.
              Members would trap and cook groundhogs, serving them at a communal feast.
              The preferred accompaniment was <Strong>&ldquo;groundhog punch&rdquo;</Strong> — a
              concoction of vodka, milk, eggs, and orange juice. Those who have tasted
              groundhog meat describe it as &ldquo;a cross between pork and chicken.&rdquo;
            </P>
            <P>
              <Strong>Clymer Freas</Strong>, editor of the <em>Punxsutawney Spirit</em>
              newspaper, is credited as the &ldquo;father&rdquo; of modern Groundhog Day.
              Beginning in 1886, Freas used his newspaper to promote the local groundhog
              tradition, transforming a regional folk practice into a media event. The
              following year — <Strong>1887</Strong> — saw the first official ceremony at
              Gobbler&apos;s Knob, a clearing in the woods outside town.
            </P>
          </Section>

          {/* ── SECTION 3: THE INNER CIRCLE ── */}
          <Section id="inner-circle" title="The Inner Circle" number="03">
            <P>
              The Punxsutawney Groundhog Club&apos;s <Strong>Inner Circle</Strong> is the
              governing body of Groundhog Day. It consists of approximately <Strong>15
              members</Strong>, all of whom are required to wear top hats and tuxedos at
              the annual ceremony. The aesthetic is deliberately anachronistic — Victorian
              formality applied to the act of consulting a rodent.
            </P>
            <P>
              The <Strong>president of the Inner Circle</Strong> holds the most critical
              role: he is the sole authorized translator of <Strong>Groundhogese</Strong>,
              the language Phil purportedly speaks. Translation requires physical contact
              with the <Strong>ancient acacia wood cane</Strong>, a ceremonial artifact
              said to enable cross-species communication. Without the cane, no translation
              is possible. Without the president, no one can wield the cane.
            </P>
            <P>
              The ceremony protocol is precise: at 7:25 AM on February 2nd, the president
              approaches Phil&apos;s burrow at Gobbler&apos;s Knob, cane in hand. Phil is
              coaxed out. The president &ldquo;listens&rdquo; to Phil&apos;s pronouncement.
              The <Strong>vice president</Strong> then reads one of two pre-written scrolls —
              one for shadow, one for no shadow — which the president has selected based on
              his &ldquo;translation.&rdquo;
            </P>
            <P>
              The <Strong>Groundhog Club</Strong> was formally established in 1899,
              originally to organize the annual &ldquo;Groundhog Feast&rdquo; — the hunting
              and eating tradition inherited from the Elks Lodge. Over time, the feast
              element faded and the prophecy element took center stage.
            </P>
            <P>
              The <Strong>kayfabe</Strong> is well-documented. The Inner Circle scripts
              the outcome in advance, sometimes declaring &ldquo;shadow&rdquo; on overcast
              days when no shadow could possibly be cast. The organization claims Phil has
              been <Strong>100% accurate</Strong> in his predictions — a claim that requires
              ignoring the actual meteorological data, which shows a <Strong>39%
              accuracy rate</Strong>. The Inner Circle&apos;s position is that any
              discrepancy between Phil&apos;s prediction and observed weather is the
              weather&apos;s fault.
            </P>
          </Section>

          {/* ── SECTION 4: THE ORACLE'S ACCURACY ── */}
          <Section id="accuracy" title="The Oracle&rsquo;s Accuracy" number="04">
            <P>
              The Inner Circle claims Phil has maintained a <Strong>100% accuracy rate</Strong> across
              his entire career. Independent meteorological analysis tells a different story: Phil&apos;s
              predictions correlate with actual weather outcomes approximately <Strong>39% of the
              time</Strong> &mdash; which is worse than a coin flip.
            </P>
            <P>
              The numbers paint a stark picture. Over <Strong>140+ years of service</Strong>, Phil has
              issued <Strong>129 recorded predictions</Strong>. Of those, <Strong>109 have been shadow
              calls</Strong> (six more weeks of winter) and only <Strong>20 have been no-shadow
              calls</Strong> (early spring). Phil overwhelmingly favors winter. The remaining years have
              no recorded prediction &mdash; including the 1943 wartime cancellation.
            </P>

            {/* Comparative accuracy chart */}
            <div
              className="rounded-lg p-6 md:p-8 my-8"
              style={{ background: "#0a0a14", border: "1px solid #1a1a2e" }}
            >
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-6"
                style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
              >
                Comparative Accuracy Analysis
              </p>
              <div className="space-y-3">
                {ACCURACY_DATA.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-4"
                    style={{
                      fontFamily: "var(--font-mono)",
                      padding: row.highlight ? "8px" : "4px 8px",
                      borderRadius: row.highlight ? "6px" : undefined,
                      border: row.highlight ? `1px solid ${row.color}44` : undefined,
                      background: row.highlight ? `${row.color}08` : undefined,
                    }}
                  >
                    <span
                      className="text-[10px] sm:text-xs shrink-0 text-right"
                      style={{
                        color: row.highlight ? row.color : "#e8e6e3",
                        width: "220px",
                        minWidth: "140px",
                        fontWeight: row.highlight ? 700 : 400,
                      }}
                    >
                      {row.label}
                    </span>
                    <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: "#111122" }}>
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${row.pct}%`,
                          background: `linear-gradient(90deg, ${row.color}cc, ${row.color})`,
                          boxShadow: `0 0 10px ${row.color}44`,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs shrink-0 w-14 text-right"
                      style={{
                        color: row.color,
                        fontWeight: row.highlight ? 700 : 400,
                      }}
                    >
                      {row.pct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <P>
              For context: Octopus Paul, a cephalopod who predicted 2010 World Cup outcomes by
              choosing between two food boxes, achieved an <Strong>85.7% accuracy rate</Strong> in a
              single tournament. A coin flip would hit 50%. CNBC financial analysts land at 38%.
              Phil sits comfortably between a dart-throwing chimpanzee and a coin toss.
            </P>
            <P>
              The Inner Circle&apos;s official position on this data is characteristically
              uncompromising: any discrepancy between Phil&apos;s forecast and observed meteorological
              conditions is attributable to <Strong>translation error</Strong> on the part of the
              presiding human interpreter. Phil communicates in Groundhogese, a language of considerable
              nuance. The acacia cane is old. Mistranslations are expected. The Oracle himself has never
              been wrong &mdash; his translators have simply failed him 61% of the time.
            </P>
            <P>
              The Gobbler&apos;s Knob Research Division, which compiled this accuracy report, is funded
              entirely by the Inner Circle and has never found fault with the Oracle&apos;s methodology.
              Peer review requests have been denied on grounds of national security.
            </P>
          </Section>

          {/* ── SECTION 5: PHIL — COMPLETE BIOGRAPHY ── */}
          <Section id="phil" title="Phil &mdash; The Complete Biography" number="05">
            <P>
              According to the Inner Circle, there has only ever been <Strong>one
              Punxsutawney Phil</Strong>. The same groundhog who made the first official
              prediction in 1887 is the same groundhog who predicts today. He is immortal.
            </P>
            <P>
              This claim is maintained despite the fact that the average groundhog lifespan
              is <Strong>6 years in the wild</Strong> (up to 14 in captivity). Phil, by
              the Inner Circle&apos;s accounting, is over <Strong>140 years old</Strong>.
              The mechanism of his immortality: the <Strong>Elixir of Life</Strong>, also
              known as &ldquo;groundhog punch&rdquo; — the same vodka-milk-egg-orange juice
              concoction from the 1880s hunting feasts. One sip extends Phil&apos;s life by
              seven years.
            </P>
            <P>
              Phil did not actually receive the name <Strong>&ldquo;Phil&rdquo;</Strong> until
              1961 — 74 years into his career. Before that, he was simply &ldquo;the
              Punxsutawney Groundhog&rdquo; or &ldquo;Br&apos;er Groundhog.&rdquo; The name
              is believed to reference <Strong>Prince Philip, Duke of Edinburgh</Strong>,
              who was at the height of his public visibility in the early 1960s, though the
              Inner Circle has never confirmed this.
            </P>
            <P>
              Phil resides year-round at the <Strong>Punxsutawney Memorial Library</Strong>,
              in a climate-controlled enclosure with his mate, <Strong>Phyllis</Strong>. He
              is transported to Gobbler&apos;s Knob only for the annual ceremony.
            </P>
            <P>
              In <Strong>2024</Strong>, the Inner Circle announced that Phil and Phyllis had
              produced <Strong>two offspring</Strong>. The babies were immediately
              characterized as non-entities — the Inner Circle made clear that the offspring
              would not inherit Phil&apos;s prophetic abilities and were essentially
              irrelevant to the succession. This aligns with the immortality doctrine: there
              is no succession because Phil does not die.
            </P>
            <P>
              Phil&apos;s historical record: <Strong>109 shadow predictions</Strong> (six
              more weeks of winter) versus <Strong>20 no-shadow predictions</Strong> (early
              spring). Phil overwhelmingly favors winter — roughly 85% of the time. Nine
              years have no recorded prediction.
            </P>
            <P>
              <Strong>PETA</Strong> has repeatedly demanded that Phil be replaced with an
              AI-powered robot groundhog, arguing that the annual ceremony causes the animal
              stress. The Inner Circle&apos;s response: Phil &ldquo;loves the attention.&rdquo;
              PETA&apos;s proposed robot would use historical weather data and machine learning
              to generate predictions. The Inner Circle views this as heresy.
            </P>
          </Section>

          {/* ── SECTION 6: SPECIES DOSSIER ── */}
          <Section id="species" title="Species Dossier" number="06">
            <P>
              Before we catalog the rival oracles, a biological primer on the creature itself is
              warranted. The Oracle is, beneath the prophecy and the politics, a member of the species
              <Strong>Marmota monax</Strong> &mdash; the largest member of the squirrel family. Yes,
              the squirrel family. That information is classified for a reason.
            </P>

            {/* Identification panel */}
            <div
              className="rounded-lg p-6 my-8"
              style={{ background: "#0a0a14", border: "1px solid #1a1a2e", fontFamily: "var(--font-mono)" }}
            >
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-5 pb-3"
                style={{ color: "#666666", borderBottom: "1px solid #1a1a2e" }}
              >
                Identification Panel
              </p>
              <div className="grid gap-3">
                {IDENTIFICATION.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[180px_1fr] sm:grid-cols-[220px_1fr] gap-4 text-xs items-baseline"
                    style={{ lineHeight: 1.6 }}
                  >
                    <span style={{ color: "#666666" }}>{item.label}</span>
                    <span
                      style={{
                        color: item.color,
                        ...(item.highlight
                          ? {
                              background: "rgba(0, 255, 136, 0.08)",
                              padding: "2px 8px",
                              border: "1px solid rgba(0, 255, 136, 0.2)",
                              display: "inline-block",
                            }
                          : {}),
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <P>
              <Strong>A critical etymological correction:</Strong> the name &ldquo;woodchuck&rdquo; has
              no connection whatsoever to the chucking of wood. It derives from the Algonquian word
              &ldquo;wuchak.&rdquo; The popular tongue-twister is based on a linguistic misunderstanding
              and has been flagged for decommissioning since 1978. The request remains pending. The name
              &ldquo;whistle-pig&rdquo; derives from the subject&apos;s alarm call &mdash; a high-pitched
              whistle used to warn colony members of incoming threats, described as &ldquo;surprisingly
              piercing for a creature of that girth.&rdquo;
            </P>

            <P>
              The subject is one of few mammalian species that enters <Strong>true hibernation</Strong>
              &mdash; not merely torpor or extended sleep. The physiological transformation is extreme:
            </P>

            {/* Vital signs */}
            <div
              className="rounded-lg p-5 my-8"
              style={{ background: "#0a0a14", border: "1px solid #1a1a2e", fontFamily: "var(--font-mono)" }}
            >
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-4"
                style={{ color: "#4488ff" }}
              >
                Hibernation Vital Signs
              </p>
              {VITAL_SIGNS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex items-baseline gap-4 text-xs py-2"
                  style={{
                    borderBottom: i < VITAL_SIGNS.length - 1 ? "1px solid rgba(26, 26, 46, 0.6)" : "none",
                  }}
                >
                  <span className="shrink-0" style={{ color: "#666666", minWidth: "180px" }}>{stat.label}:</span>
                  <span style={{ color: "#00ff88" }}>{stat.value}</span>
                </div>
              ))}
            </div>

            <P>
              A heart rate of <Strong>4 BPM</Strong>. One breath every <Strong>six minutes</Strong>.
              Core temperature dropping to 35&deg;F. By February, the subject has lost approximately
              half its body mass. Military and medical researchers study groundhog hibernation to develop
              techniques for safely lowering human heart rates during complex surgeries and for
              understanding Hepatitis B-induced liver cancer.
            </P>

            <P>
              Despite a rotund physique that suggests limited mobility, the subject demonstrates
              unexpectedly advanced physical capabilities:
            </P>

            <div className="my-6 space-y-3" style={{ fontFamily: "var(--font-mono)" }}>
              {CAPABILITIES.map((cap) => (
                <div key={cap.label} className="flex gap-3 text-xs" style={{ lineHeight: 1.8 }}>
                  <span style={{ color: "#666666", userSelect: "none" }}>&gt;</span>
                  <p>
                    <span style={{ color: "#ffaa00" }}>{cap.label}</span>{" "}
                    <span style={{ color: "#c0bdb8" }}>{cap.text}</span>
                  </p>
                </div>
              ))}
            </div>

            <P>
              The subject operates under numerous aliases across regions and languages &mdash; a partial
              registry from the operational database:
            </P>

            <div
              className="rounded-lg p-5 my-8"
              style={{ background: "#0a0a14", border: "1px solid #1a1a2e", fontFamily: "var(--font-mono)" }}
            >
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-4"
                style={{ color: "#666666" }}
              >
                Operational Aliases Database
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {ALIASES.map((alias) => (
                  <div key={alias.region} className="flex gap-3 text-xs items-baseline">
                    <span className="shrink-0" style={{ color: "#666666", minWidth: "160px" }}>{alias.region}</span>
                    <span style={{ color: "#e8e6e3" }}>{alias.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <P>
              This dossier is maintained by the Bureau of Biological Research, a division of the
              Groundhoge Day Economic Authority. All findings are considered preliminary pending the
              Oracle&apos;s review. The Oracle has not reviewed any findings since 1887.
            </P>
          </Section>

          {/* ── SECTION 7: RIVAL ORACLES ── */}
          <Section id="rivals" title="The Rival Oracles" number="07">
            <P>
              Phil is the most famous prognosticator, but he is far from the only one. Across
              North America, a network of rival oracles — groundhogs, opossums, beavers, and
              at least one cat — issue competing forecasts every February 2nd. Intelligence
              dossiers on the most notable:
            </P>

            <div className="grid gap-6 mt-8">
              {RIVALS.map((rival) => (
                <div
                  key={rival.name}
                  className="rounded-lg p-6"
                  style={{
                    background: "#0d0d14",
                    border: "1px solid #1a1a2e",
                    borderTop: `3px solid ${rival.color}`,
                  }}
                >
                  <div className="flex items-baseline gap-3 mb-1">
                    <h4
                      className="text-lg font-bold"
                      style={{ fontFamily: "var(--font-serif)", color: rival.color }}
                    >
                      {rival.name}
                    </h4>
                    <span
                      className="text-[10px] tracking-widest uppercase"
                      style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
                    >
                      {rival.location}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed mt-3"
                    style={{ fontFamily: "var(--font-mono)", color: "#999999", lineHeight: 1.8 }}
                  >
                    {rival.bio}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── SECTION 8: THE 1943 INTERRUPTION ── */}
          <Section id="1943" title="The 1943 Interruption" number="08">
            <P>
              In the 138-year history of Groundhog Day at Gobbler&apos;s Knob, there has
              been exactly <Strong>one cancellation</Strong>: 1943.
            </P>
            <P>
              The United States was deep in World War II. Rationing was in effect. Travel
              was restricted. The mood of the nation did not accommodate whimsy. The
              Punxsutawney Groundhog Club issued a terse statement:
            </P>
            <Blockquote>
              War clouds have blacked out parts of the shadow.
            </Blockquote>
            <P>
              The phrasing is remarkable — not &ldquo;the ceremony is cancelled due to the
              war,&rdquo; but an in-universe explanation that treats the shadow itself as
              something that can be disrupted by geopolitical events. The war clouds didn&apos;t
              prevent Phil from seeing his shadow; they <em>blacked out parts of it</em>.
              Even in cancellation, the Inner Circle maintained the fiction.
            </P>
            <P>
              The war ended two years later, in 1945. Phil resumed his duties without
              comment. No acknowledgment was made of the interruption. The official record
              lists 1943 as &ldquo;no record&rdquo; rather than &ldquo;cancelled.&rdquo;
            </P>
            <P>
              Every other year — through pandemics, recessions, blizzards, and political
              upheaval — the ceremony has proceeded. COVID-19 in 2021 moved the ceremony
              to a private, crowd-free event but did not cancel it. Only a world war could
              black out the shadow.
            </P>
          </Section>

          {/* ── SECTION 9: THE 1993 CULTURAL EVENT ── */}
          <Section id="culture" title="The 1993 Cultural Event" number="09">
            <P>
              In 1993, Columbia Pictures released what would become one of the most significant cultural
              artifacts in the history of February 2nd. A production depicting a meteorologist trapped
              in a temporal anomaly &mdash; forced to relive Groundhog Day in Punxsutawney until he
              achieves moral transformation &mdash; permanently altered the holiday&apos;s place in
              American consciousness.
            </P>
            <P>
              <Strong>Production intelligence:</Strong> Despite being set in Punxsutawney, the
              production was filmed entirely in Woodstock, Illinois. The real Punxsutawney was deemed
              &ldquo;too isolated&rdquo; and &ldquo;lacking adequate town square infrastructure.&rdquo;
              Casting alternatives considered included Tom Hanks, Chevy Chase, and Michael Keaton before
              Subject Murray was selected. During production, the groundhog (codename: SCOOTER) bit
              Subject Murray on the knuckle twice, drawing blood through protective gloves. Subject
              Murray completed filming.
            </P>
            <P>
              The exact duration of the depicted temporal anomaly remains classified. Multiple
              intelligence estimates exist:
            </P>

            {/* Duration estimates table */}
            <div
              className="rounded-lg overflow-hidden my-8"
              style={{ border: "1px solid #1a1a2e", fontFamily: "var(--font-mono)" }}
            >
              <div
                className="grid grid-cols-2 gap-4 px-5 py-2"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#666666" }}>Assessment</span>
                <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#666666" }}>Duration</span>
              </div>
              {[
                ["INITIAL ASSESSMENT (Director)", "~10 years"],
                ["REVISED ASSESSMENT (Director, 2006)", "30\u201340 years"],
                ["ORIGINAL DRAFT ESTIMATE", "70\u201380 years (book-reading tracking method)"],
                ["10,000-HOUR RULE ANALYSIS", "~12,400 days (33.9 years) \u2014 calculated from observed skill acquisition"],
              ].map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 gap-4 px-5 py-3"
                  style={{ borderTop: "1px solid #1a1a2e", background: "#0a0a14" }}
                >
                  <span className="text-xs" style={{ color: "#e8e6e3" }}>{row[0]}</span>
                  <span className="text-xs" style={{ color: "#999999" }}>{row[1]}</span>
                </div>
              ))}
            </div>

            <P>
              The subject demonstrated fluency in French, mastery of ice sculpture, advanced piano
              performance, and comprehensive knowledge of every resident&apos;s daily schedule. These
              competencies are consistent with the 30&ndash;40 year estimate.
            </P>
            <P>
              <Strong>Collateral damage:</Strong> The production caused significant interpersonal damage
              between Subject Murray and Director Ramis. The two had previously collaborated on three
              major operations (1980, 1981, 1984). Creative disagreements during production escalated to
              non-communication &mdash; Subject Murray sought a philosophical production while Director
              Ramis maintained romantic comedy parameters. Approximately 20 years of silence followed.
              Communication resumed only in the final months before Director Ramis&apos;s passing in 2014.
            </P>
            <P>
              <Strong>Linguistic contamination:</Strong> The 1993 incident permanently altered the English
              language. The phrase &ldquo;Groundhog Day&rdquo; was weaponized by the general population to
              describe any repetitive, monotonous, or seemingly inescapable situation. Major dictionaries
              now carry a secondary definition: &ldquo;a situation in which events are or appear to be
              continually repeated.&rdquo; Political deployment occurred as early as the 1996 U.S.
              presidential campaign. During the COVID-19 lockdowns, the phrase experienced a <Strong>4,000%
              usage spike</Strong> as populations experienced actual temporal loop conditions. The website
              TV Tropes officially classifies the time loop narrative device as the &ldquo;Groundhog Day
              Loop&rdquo; &mdash; with 47+ derivative works catalogued across film, television, and
              interactive media. Derivative works include Source Code (2011), Edge of Tomorrow (2014),
              Happy Death Day (2017), Palm Springs (2020), and Russian Doll (series).
            </P>
            <P>
              <Strong>Spiritual assessment:</Strong> Multiple religious and philosophical traditions have
              independently claimed the 1993 production as a spiritual text. Buddhists read it as a
              reincarnation allegory &mdash; the cycle of suffering and enlightenment. Christians see a
              purgatory narrative &mdash; redemption through moral transformation. Jewish scholars
              identify teshuvah (repentance) &mdash; performing moral deeds to break destructive patterns.
              Mental health professionals recommend it to patients, and addiction recovery programs use it
              as a metaphor for breaking repetitive cycles.
            </P>
            <P>
              <Strong>Tourism impact:</Strong> Annual attendance at the Punxsutawney festival increased
              from approximately <Strong>2,000 to 35,000+</Strong> following the cultural event&apos;s
              release. The Library of Congress selected the production for preservation in the National
              Film Registry in 2006. Its significance is no longer disputed.
            </P>
          </Section>

          {/* ── SECTION 10: TIMELINE ── */}
          <Section id="timeline" title="Timeline" number="10">
            <div className="relative mt-8 ml-4">
              {/* vertical line */}
              <div
                className="absolute left-0 top-0 bottom-0 w-px"
                style={{ background: "linear-gradient(to bottom, #ffaa00, #1a1a2e)" }}
              />

              {TIMELINE.map((item, i) => (
                <div key={item.year} className="relative pl-10 pb-10 last:pb-0">
                  {/* dot */}
                  <div
                    className="absolute left-0 top-1 w-3 h-3 rounded-full -translate-x-[6px]"
                    style={{
                      background: i === TIMELINE.length - 1 ? "#00ff88" : "#ffaa00",
                      boxShadow: i === TIMELINE.length - 1
                        ? "0 0 12px rgba(0,255,136,0.4)"
                        : "0 0 8px rgba(255,170,0,0.3)",
                    }}
                  />
                  <p
                    className="text-sm font-bold mb-1"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: i === TIMELINE.length - 1 ? "#00ff88" : "#ffaa00",
                    }}
                  >
                    {item.year}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ fontFamily: "var(--font-mono)", color: "#999999", lineHeight: 1.7 }}
                  >
                    {item.event}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ─── FOOTER RETURN LINK ─── */}
          <div className="mt-20 pt-8 border-t" style={{ borderColor: "#1a1a2e" }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase transition-colors hover:text-white"
              style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
            >
              <span>&larr;</span> RETURN TO HEADQUARTERS
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─── Reusable sub-components (inline) ─── */

function Section({
  id,
  title,
  number,
  children,
}: {
  id: string;
  title: string;
  number: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-20 scroll-mt-8">
      <div className="flex items-baseline gap-4 mb-8">
        <span
          className="text-xs tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "#333333" }}
        >
          {number}
        </span>
        <h2
          className="text-3xl md:text-4xl font-bold"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h2>
      </div>
      <div
        className="h-px w-24 mb-8"
        style={{ background: "#ffaa00" }}
      />
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-5 text-sm leading-relaxed"
      style={{ fontFamily: "var(--font-mono)", color: "#c0bdb8", lineHeight: 1.85 }}
    >
      {children}
    </p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: "#e8e6e3", fontWeight: 600 }}>{children}</strong>;
}

function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      className="my-6 pl-5 py-3 text-sm italic"
      style={{
        fontFamily: "var(--font-mono)",
        color: "#ffaa00",
        borderLeft: "3px solid #ffaa00",
        background: "rgba(255,170,0,0.04)",
        lineHeight: 1.85,
      }}
    >
      {children}
    </blockquote>
  );
}
