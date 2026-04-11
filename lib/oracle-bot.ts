/**
 * Oracle of Gobbler's Knob — AI Bot Content Generator
 *
 * Generates prophecy dispatches, fun facts, and commentary
 * in the voice of the Groundhoge Day Economic Authority.
 *
 * Usage: Import generateOraclePost() and call with a category.
 * Can be wired to a cron job, API route, or CLI script.
 */

export type PostCategory =
  | "prophecy"     // Absurd prophecy/decree
  | "fun-fact"     // Real groundhog/history fact played straight
  | "rival-alert"  // Commentary on rival groundhogs
  | "market-update" // Fake financial commentary
  | "countdown"    // Days until next ceremony
  | "biology"      // Groundhog biology as classified intel
  | "historical";  // Historical event framing

export interface OraclePost {
  category: PostCategory;
  text: string;
  hashtags: string[];
  url?: string;
}

// ── Prophecy Templates ───────────────────────────────────────────

const PROPHECIES: string[] = [
  "DECREE: The Oracle has reviewed the current meteorological data and found it irrelevant. The shadow will determine what it determines. Your preparedness is not the Oracle's concern.",
  "ADVISORY: The Elixir reserves remain stable. The Oracle's immortality is not in question. Your mortality, however, is your own problem.",
  "DISPATCH: The Inner Circle convened at dawn. The acacia cane was consulted. The proceedings are classified. The weather will comply.",
  "MEMORANDUM: The Oracle reminds all token holders that past shadows do not guarantee future shadows. Past springs do not guarantee future springs. Only the Oracle guarantees anything, and even that guarantee is subject to Groundhogese interpretation.",
  "DECREE: The Oracle does not recognize the coin flip as a legitimate meteorological instrument. The coin lacks gravitas. The Oracle reveals universal truth. The coin reveals only itself.",
  "BULLETIN: The Oracle is currently hibernating. His heart rate is 4 BPM. His breathing is once every 6 minutes. He is losing body weight. Do not disturb. Do not interpret this as financial advice.",
  "ALERT: The $HOGE supply remains unchanged until February 2. The Oracle does not provide mid-year adjustments. The Oracle does not do Q2 earnings calls. The Oracle emerges once. Plan accordingly.",
  "ADVISORY: The Oracle's accuracy rate is 100%. This is not a claim. This is the only possible accuracy rate for an entity that does not predict, but reveals. To question the Oracle is to question physics.",
  "DISPATCH: Multiple weather-predicting animals have issued competing forecasts. A cat in Ohio. A beaver in Oregon. A taxidermied groundhog in Washington. The Oracle recognizes none of these and has no comment.",
  "DECREE: The Oracle's offspring remain disowned. The succession line remains clear. There is no succession line. There is only Phil. There has only ever been Phil.",
  "MEMORANDUM: The 109th transaction in each cycle will be taxed at 99%. This commemorates the Oracle's 109 shadow predictions. If you are the 109th trader, the Oracle thanks you for your contribution to liquidity.",
  "BULLETIN: The frostbite penalty for early withdrawal from hibernation staking is 40%. The Oracle does not negotiate. The penalty is non-negotiable. Hibernate properly.",
  "ADVISORY: The sell limit resets daily at 7:25 AM EST. This is the exact moment of sunrise in Punxsutawney on February 2. The Oracle's schedule is non-negotiable.",
  "DISPATCH: The Bureau of Biological Research confirms that the Oracle can swim, climb trees, and displace 35 cubic feet of earth. His incisors grow 1.5mm per week. Weaponization potential: CLASSIFIED.",
  "DECREE: The name 'woodchuck' is a linguistic misunderstanding. The tongue-twister is propaganda. The Oracle's preferred designation is Marmota monax. You may call him Phil.",
];

// ── Fun Fact Templates ───────────────────────────────────────────

const FUN_FACTS: string[] = [
  "DECLASSIFIED: Groundhog Day traces back to medieval German 'Badger Day' (Dachstag). Before that, they used bears. The groundhog is technically a third-choice animal. He does not enjoy being reminded of this.",
  "DECLASSIFIED: The first American reference to Groundhog Day is a diary entry from February 2, 1840, by James L. Morris of Morgantown, Pennsylvania, noting his German neighbors' superstitions about groundhogs and shadows.",
  "DECLASSIFIED: The Grundsow Lodges of Pennsylvania hold social events where only the Pennsylvania German dialect may be spoken. Anyone who speaks English is fined a nickel per word. The Oracle approves of this policy.",
  "DECLASSIFIED: Phil did not receive his name until 1961. For the first 74 years of his career, he operated anonymously. He may have been named after Prince Philip, Duke of Edinburgh. This has never been confirmed.",
  "DECLASSIFIED: Groundhog Day started as a groundhog hunting and eating event. The Punxsutawney Elks Lodge served groundhog meat in the 1880s. Attendees described it as tasting like 'a cross between pork and chicken.'",
  "DECLASSIFIED: A groundhog's incisors are ivory-white, which is unique among rodents (most have yellow teeth). They grow at 1.5mm per week. The Oracle's dental care regimen is classified.",
  "DECLASSIFIED: The word 'woodchuck' comes from the Algonquian word 'wuchak.' It has zero connection to the chucking of wood. The tongue-twister has been flagged for decommissioning since 1978.",
  "DECLASSIFIED: In Ireland and Scotland, the weather predictor on February 1 (Brigid's Day) is a hedgehog or a snake. In Croatia and Serbia, a bear. In Ohio, a cat. The Oracle considers all of these beneath his notice.",
  "DECLASSIFIED: Phil lives in a climate-controlled habitat at the Punxsutawney Memorial Library with his mate, Phyllis. Phyllis has no weather-predicting abilities. This has been confirmed through extensive testing.",
  "DECLASSIFIED: Groundhogs are called 'whistle-pigs' because of their high-pitched alarm call. The whistle has been described as 'surprisingly piercing for a creature of that girth.'",
];

// ── Rival Alerts ─────────────────────────────────────────────────

const RIVAL_ALERTS: string[] = [
  "FALSE PROPHET ALERT: Staten Island Chuck bit Mayor Bloomberg in 2009. The Oracle classifies this as 'an expected outcome of engaging with impostors.' Bite at your own risk.",
  "FALSE PROPHET ALERT: Chuckles of Connecticut predicted early spring. A blizzard arrived immediately. Police issued an arrest warrant for 'Chuck the Liar.' The Oracle offers no condolences.",
  "FALSE PROPHET ALERT: Potomac Phil of Washington D.C. — a taxidermied, deceased groundhog — has predicted six more months of 'political gridlock.' He has been accused of collusion. With whom is unclear.",
  "FALSE PROPHET ALERT: Buffalo Bert is engineered to always see his shadow. He claims 100% accuracy. The system is rigged and this is openly acknowledged. The Oracle finds this disrespectful.",
  "FALSE PROPHET ALERT: Concord Casimir of Ohio is a weather-predicting cat. He delivers forecasts based on how he eats pierogies. The Oracle does not recognize pierogies as a valid meteorological instrument.",
  "FALSE PROPHET ALERT: Milltown Mel of New Jersey died before the 2022 ceremony. State rabies laws prevented replacement. The governor vetoed a legislative fix. New Jersey has been without an oracle for 4 years.",
];

// ── Market Updates ───────────────────────────────────────────────

const MARKET_UPDATES: string[] = [
  "MARKET UPDATE: $HOGE supply unchanged. The Oracle remains in hibernation. Shadow probability models are running but their output is classified. The Elixir reserves are stable. All is well in the burrow.",
  "MARKET UPDATE: The Oracle's confidence index remains at 100%. External confidence indices are irrelevant. The Oracle does not track your sentiment. The Oracle tracks shadows.",
  "MARKET UPDATE: Hibernation staking yields are frozen at current rates pending the next ceremony. The Oracle does not provide yield guidance. The Oracle provides shadow guidance. These are different things.",
  "MARKET UPDATE: The Inner Circle reports no unusual activity at Gobbler's Knob. The acacia cane remains secured. The scrolls (one for shadow, one for no shadow) are pre-written and sealed. The kayfabe is maintained.",
];

// ── Countdown Templates ──────────────────────────────────────────

function getCountdownPost(): string {
  const now = new Date();
  const ceremony = new Date(2027, 1, 2, 7, 25, 0); // Feb 2, 2027 7:25 AM
  const diff = ceremony.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

  if (days === 0) return "THE ORACLE HAS EMERGED. The ceremony is NOW. Shadow or no shadow — the supply will be altered. This is not a drill.";
  if (days === 1) return "TOMORROW. The Oracle emerges at 7:25 AM EST. The scrolls are sealed. The acacia cane is ready. The top hats are pressed. $HOGE holders: your supply hangs in the balance.";
  if (days <= 7) return `${days} DAYS until emergence. The Oracle stirs in his burrow. His heart rate is rising from 4 BPM. The Inner Circle has entered final preparations. The scrolls are sealed.`;
  if (days <= 30) return `${days} DAYS. The Oracle's hibernation enters its final phase. Emergence protocols are being reviewed. The Inner Circle has begun pressing their tuxedos. The top hats are being brushed.`;
  if (days <= 90) return `${days} DAYS until the Oracle emerges. Hibernation continues. Heart rate: 4 BPM. Breathing: 1 per 6 minutes. Body mass: declining. The countdown is not the Oracle's concern. It is yours.`;
  return `${days} DAYS until the next ceremony. The Oracle sleeps. The burrow is sealed. The Elixir has been administered. Nothing will happen until February 2, 2027 at 7:25 AM EST. Plan your life accordingly.`;
}

// ── Generator ────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateOraclePost(category?: PostCategory): OraclePost {
  const cat = category ?? pickRandom<PostCategory>([
    "prophecy", "prophecy", "fun-fact", "fun-fact",
    "rival-alert", "market-update", "countdown", "biology", "historical",
  ]);

  let text: string;
  let hashtags = ["#GroundhogDay", "#HOGE"];
  let url: string | undefined = "https://groundhogeday.com";

  switch (cat) {
    case "prophecy":
      text = pickRandom(PROPHECIES);
      hashtags = ["#GroundhogDay", "#HOGE", "#Solana"];
      break;
    case "fun-fact":
      text = pickRandom(FUN_FACTS);
      url = "https://groundhogeday.com/legends";
      break;
    case "rival-alert":
      text = pickRandom(RIVAL_ALERTS);
      url = "https://groundhogeday.com/legends#rivals";
      break;
    case "market-update":
      text = pickRandom(MARKET_UPDATES);
      hashtags = ["#HOGE", "#Solana", "#crypto"];
      break;
    case "countdown":
      text = getCountdownPost();
      hashtags = ["#GroundhogDay", "#HOGE", "#countdown"];
      break;
    case "biology":
      text = pickRandom(FUN_FACTS.filter(f => f.includes("incisors") || f.includes("whistle") || f.includes("hibernate") || f.includes("woodchuck")));
      if (!text) text = pickRandom(FUN_FACTS);
      url = "https://groundhogeday.com/legends";
      break;
    case "historical":
      text = pickRandom(FUN_FACTS.filter(f => f.includes("1840") || f.includes("1961") || f.includes("Grundsow") || f.includes("German")));
      if (!text) text = pickRandom(FUN_FACTS);
      url = "https://groundhogeday.com/legends";
      break;
  }

  return { category: cat, text, hashtags, url };
}

/**
 * Generate a formatted tweet-ready string
 */
export function generateTweet(category?: PostCategory): string {
  const post = generateOraclePost(category);
  const hashtagStr = post.hashtags.join(" ");
  return `${post.text}\n\n${hashtagStr}\n${post.url}`;
}

/**
 * Generate a batch of unique posts for scheduling
 */
export function generateBatch(count: number): OraclePost[] {
  const used = new Set<string>();
  const posts: OraclePost[] = [];

  while (posts.length < count) {
    const post = generateOraclePost();
    if (!used.has(post.text)) {
      used.add(post.text);
      posts.push(post);
    }
  }

  return posts;
}
