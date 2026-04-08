# Groundhoge Day ($HOGE) — Website Design Spec

**Date:** 2026-04-08
**Status:** Approved
**Stack:** Next.js on Vercel
**Domain:** groundhogeday.com (registered, Vercel)

---

## Design Direction

**Absurdist corporate** — Bloomberg terminal meets meme coin. Serious fintech presentation, absurd content. Clean serif typography, professional grid layout, formal financial language — all describing a rodent's shadow. Subtle animations that get progressively unhinged the longer you scroll.

## Color Palette

- **Background:** Dark (#0a0a0f) — terminal/Bloomberg aesthetic
- **Primary text:** Off-white (#e8e6e3)
- **Accent green (bullish/spring):** #00ff88
- **Accent blue (bearish/winter):** #4488ff
- **Accent amber (terminal):** #ffaa00
- **Muted text:** #666666
- **Card borders:** #1a1a2e

## Typography

- **Headlines:** Serif (Playfair Display or similar) — formal, institutional
- **Body/data:** Monospace (JetBrains Mono or IBM Plex Mono) — terminal energy
- **Small caps for labels and classifications**

---

## Site Structure (MVP — Phase 1)

### 1. Ticker Bar (Fixed Top)

Scrolling horizontal ticker tape, styled like financial news crawl:

```
$HOGE 0.000000 ^0.00% | SHADOW PROBABILITY: 61% | DAYS IN BURROW: 247 | ELIXIR RESERVES: CLASSIFIED | ORACLE STATUS: HIBERNATING | INNER CIRCLE ALERT: NONE
```

- Fixed position, always visible
- Monospace font, amber on dark
- Smooth infinite scroll animation

### 2. Hero Section

Full viewport height. Centered layout.

**Logo:** Centered (TBD — groundhog silhouette in corporate/seal style)

**Tagline** (small caps serif, letter-spaced):
> THE WORLD'S FIRST WEATHER-DEPENDENT DEFLATIONARY ASSET

**Countdown Clock** — centerpiece element:
- Large glowing digits styled like a trading terminal
- Four units: DAYS : HOURS : MINUTES : SECONDS
- Counting down to February 2, 2027, 7:25 AM EST
- Subtle pulse animation on the seconds

**Sub-text** (muted, small):
> Oracle status: HIBERNATING. Next emergence: February 2, 2027, 7:25 AM EST.

**CTA Button:** "Read the Prophecy" (scrolls to tokenomics section)

**Live status indicator:** Green dot + "HIBERNATING" badge (shows "EMERGING" only on Feb 2)

### 3. The Prophecy (Tokenomics Section)

**Classification header:**
> CONFIDENTIAL — GOBBLER'S KNOB ECONOMIC RESEARCH DIVISION

Two-column layout presenting opposing scenarios like competing analyst reports:

**Left Column — SCENARIO A: SHADOW DETECTED**
- Frost/blue tint (#4488ff at 10% opacity background)
- Snowflake icon
- Formal bullet points:
  - "Circulating supply reduced by 6.00% via autonomous burn protocol"
  - "Sell taxes elevated to simulate adverse winter market conditions"
  - "Hibernation staking yields frozen at current rates"
- Risk badge: CRYPTO WINTER — SEVERE

**Right Column — SCENARIO B: NO SHADOW DETECTED**
- Warm/green tint (#00ff88 at 10% opacity background)
- Sun icon
- Formal bullet points:
  - "Supply expansion of 3.90% distributed pro-rata to all active wallets"
  - "Liquidity pools thawed. Transaction friction reduced."
  - "Hibernation rewards enter 7x Elixir multiplier season"
- Risk badge: ALTSEASON THAW — BULLISH

**Centered italic line below both columns:**
> "The Oracle's accuracy rate stands at 39%. Invest accordingly."

**Disclaimer block** (styled as SEC boilerplate):
> "Groundhoge Day ($HOGE) makes no representations regarding future meteorological events. Shadow-based tokenomics are determined by a rodent and should not be construed as financial advice. Past shadows do not guarantee future shadows."

### 4. The Oracle's Record (Historical Data Terminal)

Full-width Bloomberg terminal aesthetic — dark bg, monospace, green/amber text.

**Header:** GOBBLER'S KNOB TERMINAL — SHADOW HISTORY DATABASE

**Data table** — real historical predictions:

| YEAR | OUTCOME | SHADOW DURATION | ACCURACY | MARKET IMPACT |
|------|---------|----------------|----------|---------------|
| 2026 | SHADOW | 6 WKS WINTER | PENDING | N/A — PRE-LAUNCH |
| 2025 | NO SHADOW | EARLY SPRING | INCORRECT | WOULD HAVE MINTED 3.9% |
| 2024 | NO SHADOW | EARLY SPRING | CORRECT | WOULD HAVE MINTED 3.9% |
| 2023 | SHADOW | 6 WKS WINTER | INCORRECT | WOULD HAVE BURNED 6% |

- Scrollable back to 1887
- Running cumulative supply simulation at bottom
- All data sourced from real historical records

**Blinking terminal prompt:**
```
gobbler-knob:~ $ CURRENT ORACLE STATUS: HIBERNATING
gobbler-knob:~ $ NEXT SCHEDULED EMERGENCE: 2027-02-02T07:25:00-05:00
gobbler-knob:~ $ DAYS UNTIL PROPHECY: |||||||||||...  300/365
gobbler-knob:~ $ _
```

**LED stat bar:**
- TOTAL SHADOWS: 109 | TOTAL NO-SHADOWS: 20 | CAREER ACCURACY: 39%

### 5. Community & Footer

**Three-column "department" grid:**

**BUREAU OF COMMUNICATIONS**
- Official Dispatches (X/Twitter)
- The Burrow (Telegram)
- Inner Circle Chambers (Discord)

**DIVISION OF RESEARCH**
- The Prophecy (Whitepaper)
- Oracle Historical Database (CoinGecko)
- Contract Audit (Solscan)

**OFFICE OF ACQUISITIONS**
- Acquire $HOGE (Jupiter)
- Acquire $HOGE (Raydium)
- Hibernation Portal (Staking) — "COMING Q3 2026"

**Footer:**
> GROUNDHOGE DAY ECONOMIC AUTHORITY
> Established 1883 - Gobbler's Knob, Pennsylvania
>
> This site is operated by the Groundhoge Day Economic Authority, a decentralized autonomous organization governed by 15 top-hat-wearing individuals and one rodent. The Authority makes no claims regarding meteorological accuracy, financial returns, or the immortality of any marmot. All economic activity on this platform is determined annually by the presence or absence of a shadow. By accessing this site you acknowledge that you are placing your financial future in the hands of a burrowing mammal.
>
> $HOGE is not a security. $HOGE is a shadow.

---

## Tokenomics Reference (Legal-Scrubbed)

| Property | Value | Lore Source |
|----------|-------|-------------|
| Initial supply | 1,883,000,000 | Phil's birth year (1883) |
| Decimal places | 2 | February 2nd |
| Shadow burn | 6.00% | 6 weeks of winter |
| No-shadow mint | 3.90% | Phil's 39% accuracy |
| Daily sell limit | 1,883 tokens/wallet | Birth year again |
| Sell limit reset | 7:25 AM EST daily | Sunrise in Punxsutawney on Feb 2 |
| Transaction tax | 6.25% total | Feb 2 + leap year |
| Tax split | 2% stakers / 2% liquidity / 2.25% burn | - |
| Hibernation lockup | 42 days | 6 weeks |
| Frostbite penalty | 40% | Phil's actual accuracy |
| $ELIXIR earn rate | 1 per 7 weeks staked | Elixir extends life 7 years |
| $ELIXIR utility | Bypass frostbite OR 7x yield | - |
| Inner Circle NFTs | 15 total | Real Inner Circle size |
| Acacia Cane NFT | 1-of-1, 6x vote multiplier | Real tradition |
| 109th tx trap | 99% tax to liquidity | Phil's 109 shadow predictions |
| callChuck() | Anti-MEV hidden function | Staten Island Chuck |
| Death/cancel protocol | 24hr halt, 1.943% burn, pools unlock | 1943 cancellation |

## Phase 2 (Future)

- Merch store
- $ELIXIR token launch
- Inner Circle NFT mint
- Prediction market integration (Polymarket)
- "The Oracle of Gobbler's Knob" AI Twitter bot
- Rival groundhog token wars
- DeSci immortality grant DAO

## IP/Legal Notes

- NO references to Groundhog Day film, Bill Murray, character names
- NO use of "Punxsutawney Phil" (trademarked) — use "Phil", "The Oracle", "The Seer"
- All lore sourced from real Groundhog Day holiday traditions (public domain)
- Groundhog Day as a holiday = public cultural event, safe to use
- Gobbler's Knob, Inner Circle, Groundhogese, Elixir of Life = real traditions, safe
