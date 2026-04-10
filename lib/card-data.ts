export interface CardDef {
  slug: string;
  title: string;
  subtitle: string;
  format: "twitter" | "instagram";
}

export const CARDS: CardDef[] = [
  {
    slug: "accuracy-comparison",
    title: "THE ORACLE'S ACCURACY REPORT",
    subtitle: "Comparative analysis of meteorological prediction sources",
    format: "twitter",
  },
  {
    slug: "hibernation-vitals",
    title: "HIBERNATION PROTOCOL",
    subtitle: "Marmota monax vital sign telemetry",
    format: "twitter",
  },
  {
    slug: "animal-evolution",
    title: "WEATHER ORACLE SUCCESSION",
    subtitle: "A brief history of animal-based weather prediction",
    format: "twitter",
  },
  {
    slug: "phil-resume",
    title: "CURRICULUM VITAE -- THE ORACLE",
    subtitle: "140+ years of uninterrupted public service",
    format: "twitter",
  },
  {
    slug: "rival-oracles",
    title: "INTELLIGENCE BRIEFING: FALSE PROPHETS",
    subtitle: "Known pretenders and unauthorized weather oracles",
    format: "twitter",
  },
  {
    slug: "tokenomics-lore",
    title: "$HOGE -- EVERY NUMBER IS LORE",
    subtitle: "Tokenomics rooted in 140 years of groundhog history",
    format: "twitter",
  },
];

export function getCard(slug: string): CardDef | undefined {
  return CARDS.find((c) => c.slug === slug);
}
