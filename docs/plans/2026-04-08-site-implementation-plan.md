# Groundhoge Day Website — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and deploy the Groundhoge Day ($HOGE) marketing site — a Bloomberg-terminal-meets-meme-coin single page with countdown clock, tokenomics display, historical data terminal, and community links.

**Architecture:** Next.js 16 App Router, single-page site with 5 sections. All static content (no API routes needed for MVP). Tailwind CSS for styling. Google Fonts for Playfair Display (serif headlines) and JetBrains Mono (monospace/terminal). Deployed to Vercel at groundhogeday.com.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Playfair Display + JetBrains Mono fonts, Vercel hosting

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`

**Step 1: Initialize Next.js with TypeScript + Tailwind**

```bash
cd /Users/dougkvamme/projects/groundhogeday
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --yes
```

If prompted about existing `docs/` folder, proceed — it won't be overwritten.

**Step 2: Verify it runs**

```bash
cd /Users/dougkvamme/projects/groundhogeday
npm run dev
```

Expected: Dev server starts at localhost:3000, default Next.js page loads.

**Step 3: Clean up defaults**

Strip `app/page.tsx` to a minimal shell. Strip `app/globals.css` to just the Tailwind imports. Remove any default Next.js hero content.

**Step 4: Set up fonts and global styles**

In `app/layout.tsx`:
- Import Playfair Display (serif) and JetBrains Mono (monospace) from `next/font/google`
- Set metadata: title "Groundhoge Day ($HOGE) — The World's First Weather-Dependent Deflationary Asset", description about the project
- Dark background (#0a0a0f), off-white text (#e8e6e3)

In `app/globals.css`:
- CSS variables for the color palette:
  - `--bg: #0a0a0f`
  - `--text: #e8e6e3`
  - `--green: #00ff88`
  - `--blue: #4488ff`
  - `--amber: #ffaa00`
  - `--muted: #666666`
  - `--card-border: #1a1a2e`
- Smooth scrolling on html
- Custom scrollbar styling (dark, thin)

**Step 5: Initialize git and commit**

```bash
cd /Users/dougkvamme/projects/groundhogeday
git init
git add -A
git commit -m "feat: scaffold Next.js 16 project with Tailwind and fonts"
```

---

## Task 2: Ticker Bar Component

**Files:**
- Create: `components/TickerBar.tsx`
- Modify: `app/page.tsx`

**Step 1: Build the TickerBar component**

Create `components/TickerBar.tsx`:
- Fixed position at top of viewport, z-50
- Dark background (#0a0a0f) with subtle bottom border (#1a1a2e)
- JetBrains Mono font, amber (#ffaa00) text, small size (text-xs)
- Ticker content string: `$HOGE 0.000000 ▲ 0.00%  ·  SHADOW PROBABILITY: 61%  ·  DAYS IN BURROW: {calculated}  ·  ELIXIR RESERVES: CLASSIFIED  ·  ORACLE STATUS: HIBERNATING  ·  INNER CIRCLE ALERT: NONE`
- "DAYS IN BURROW" should be dynamically calculated: days since Feb 2, 2026 (last emergence)
- Infinite scroll animation using CSS `@keyframes ticker` — translate from 0 to -50% (content is duplicated for seamless loop)
- Duration: ~30s for full scroll cycle
- Height: ~28px

**Step 2: Add to page**

Import TickerBar into `app/page.tsx`. Render at top. Add `pt-7` (28px) to the main content wrapper so content isn't hidden behind fixed ticker.

**Step 3: Verify**

```bash
npm run dev
```

Expected: Amber scrolling ticker at top of page, smooth infinite loop, correct days-in-burrow count.

**Step 4: Commit**

```bash
git add components/TickerBar.tsx app/page.tsx
git commit -m "feat: add scrolling ticker bar with live burrow day count"
```

---

## Task 3: Hero Section with Countdown Clock

**Files:**
- Create: `components/Hero.tsx`, `components/CountdownClock.tsx`
- Modify: `app/page.tsx`

**Step 1: Build the CountdownClock component**

Create `components/CountdownClock.tsx`:
- Client component (`"use client"`)
- Target date: February 2, 2027, 7:25 AM EST (new Date('2027-02-02T07:25:00-05:00'))
- `useEffect` with `setInterval` every 1000ms to update countdown
- Calculate: days, hours, minutes, seconds remaining
- Display as 4 large digit groups in JetBrains Mono
- Each group: large number on top, small label below (DAYS / HOURS / MINUTES / SECONDS)
- Separators between groups: `:` in muted color
- Digits styled: text-6xl md:text-8xl, slight green (#00ff88) glow via text-shadow
- Seconds digit gets a subtle pulse animation (CSS `animate-pulse` but subtle)
- Handle edge case: if countdown reaches 0, display "THE ORACLE HAS EMERGED"

**Step 2: Build the Hero component**

Create `components/Hero.tsx`:
- Full viewport height (min-h-screen), flex centered column layout
- Placeholder for logo: text "GROUNDHOGE DAY" in Playfair Display, text-4xl, letter-spacing wide, uppercase. Below it "$HOGE" in amber monospace.
- Tagline: "THE WORLD'S FIRST WEATHER-DEPENDENT DEFLATIONARY ASSET" — Playfair Display, small caps (tracking-[0.3em]), text-sm, muted color, centered
- CountdownClock component centered below tagline
- Below clock — muted small text: "Oracle status: HIBERNATING · Next emergence: February 2, 2027, 7:25 AM EST"
- Status indicator: small green (#00ff88) dot (w-2 h-2 rounded-full) + "HIBERNATING" text
- CTA button: "Read the Prophecy" — bordered button, serif font, letter-spaced. On click: `document.getElementById('prophecy')?.scrollIntoView({ behavior: 'smooth' })`
- Subtle radial gradient on the background — slight glow behind the countdown clock

**Step 3: Add to page**

Import Hero into `app/page.tsx`. Render below TickerBar.

**Step 4: Verify**

```bash
npm run dev
```

Expected: Full-height hero, countdown actively ticking, green glow on digits, smooth scroll on CTA click.

**Step 5: Commit**

```bash
git add components/Hero.tsx components/CountdownClock.tsx app/page.tsx
git commit -m "feat: add hero section with live countdown clock to Feb 2 2027"
```

---

## Task 4: The Prophecy (Tokenomics Section)

**Files:**
- Create: `components/Prophecy.tsx`
- Modify: `app/page.tsx`

**Step 1: Build the Prophecy component**

Create `components/Prophecy.tsx`:
- Section with `id="prophecy"` for scroll targeting
- Generous vertical padding (py-24)
- Classification header centered: "CONFIDENTIAL — GOBBLER'S KNOB ECONOMIC RESEARCH DIVISION" in JetBrains Mono, text-xs, tracking-widest, amber (#ffaa00), uppercase, with a dashed border around it (styled like a classified document stamp)

**Two-column grid (md:grid-cols-2, gap-8):**

**Left card — SCENARIO A: SHADOW DETECTED**
- Background: #4488ff at ~8% opacity
- Top border: 2px solid #4488ff
- Header: "SCENARIO A" small label, then "SHADOW DETECTED" larger serif text
- Snowflake emoji or unicode ❄ as icon
- Bullet list in monospace, formal language:
  - "Circulating supply reduced by 6.00% via autonomous burn protocol"
  - "Sell taxes elevated to simulate adverse winter market conditions"
  - "Hibernation staking yields frozen at current rates"
  - "Community advised to enter extended hibernation"
- Risk badge at bottom: "CRYPTO WINTER — SEVERE" in blue, monospace, small, with border

**Right card — SCENARIO B: NO SHADOW DETECTED**
- Background: #00ff88 at ~8% opacity
- Top border: 2px solid #00ff88
- Header: "SCENARIO B" small label, then "NO SHADOW DETECTED" larger serif text
- Sun unicode ☀ as icon
- Bullet list:
  - "Supply expansion of 3.90% distributed pro-rata to all active wallets"
  - "Liquidity pools thawed. Transaction friction reduced."
  - "Hibernation rewards enter 7x Elixir multiplier season"
  - "The Burrow is open. Emergence protocol activated."
- Risk badge: "ALTSEASON THAW — BULLISH" in green, monospace, small, with border

**Below both columns, centered:**
- Italic serif quote: "The Oracle's accuracy rate stands at 39%. Invest accordingly."
- Disclaimer block in text-xs, muted color, max-w-3xl centered, styled like SEC boilerplate with subtle border-top

**Step 2: Add to page**

Import Prophecy into `app/page.tsx`. Render after Hero.

**Step 3: Verify**

```bash
npm run dev
```

Expected: Two contrasting cards, classified header, disclaimer at bottom. Responsive — stacks to single column on mobile.

**Step 4: Commit**

```bash
git add components/Prophecy.tsx app/page.tsx
git commit -m "feat: add Prophecy tokenomics section with shadow/no-shadow scenarios"
```

---

## Task 5: The Oracle's Record (Historical Data Terminal)

**Files:**
- Create: `components/OracleTerminal.tsx`, `lib/shadow-history.ts`
- Modify: `app/page.tsx`

**Step 1: Create the shadow history data file**

Create `lib/shadow-history.ts`:
- Export an array of objects: `{ year: number, shadow: boolean, accuracy: 'correct' | 'incorrect' | 'pending' | 'no-record' }`
- Include all known years. Key data points:
  - First prediction: 1887 (shadow)
  - No prediction: 1943 (WWII)
  - No-shadow years: 1902, 1934, 1942, 1950, 1970, 1975, 1983, 1986, 1988, 1990, 1995, 1997, 1999, 2007, 2011, 2013, 2016, 2019, 2020, 2024, 2025
  - All other years: shadow
  - 2026: shadow, accuracy pending
- Export helper: `getMarketImpact(shadow: boolean): string` — returns "WOULD HAVE BURNED 6%" or "WOULD HAVE MINTED 3.9%"
- Export helper: `getSimulatedSupply(records): number[]` — starting from 1,883,000,000 in 1887, apply 6% burn or 3.9% mint for each year to show what supply would look like today

**Step 2: Build the OracleTerminal component**

Create `components/OracleTerminal.tsx`:
- Client component for scroll interaction
- Full-width section, dark background slightly different from main (#060610)
- Top border: 1px solid #1a1a2e
- Header: "GOBBLER'S KNOB TERMINAL — SHADOW HISTORY DATABASE" in JetBrains Mono, amber, text-xs, tracking-widest

**Data table:**
- Monospace font throughout
- Column headers: YEAR | OUTCOME | DURATION | ACCURACY | MARKET IMPACT
- Green text for "NO SHADOW" rows, amber for "SHADOW" rows
- Show most recent 10 years by default
- "Show All Records (1887-2026)" button to expand
- Scrollable container with max height when expanded
- 2026 row highlighted with subtle border
- 1943 row shows "NO CEREMONY — WAR CLOUDS" in red

**Terminal prompt block below table:**
```
gobbler-knob:~ $ CURRENT ORACLE STATUS: HIBERNATING
gobbler-knob:~ $ NEXT SCHEDULED EMERGENCE: 2027-02-02T07:25:00-05:00
gobbler-knob:~ $ DAYS UNTIL PROPHECY: [progress bar] {days}/365
gobbler-knob:~ $ _
```
- The `$` prompt in green, text in amber
- Blinking cursor animation on the last line (CSS `@keyframes blink`)
- Progress bar made of unicode block chars (█ and ░)

**LED stat bar at bottom:**
- Three stats in a row: TOTAL SHADOWS: 109 | TOTAL NO-SHADOWS: 20 | CAREER ACCURACY: 39%
- Styled like LED displays — green (#00ff88) on dark, slight glow
- Small monospace text

**Step 3: Add to page**

Import OracleTerminal into `app/page.tsx`. Render after Prophecy.

**Step 4: Verify**

```bash
npm run dev
```

Expected: Terminal section with scrollable table, blinking cursor, LED stats, all real historical data.

**Step 5: Commit**

```bash
git add components/OracleTerminal.tsx lib/shadow-history.ts app/page.tsx
git commit -m "feat: add Oracle terminal with full shadow history back to 1887"
```

---

## Task 6: Community Section & Footer

**Files:**
- Create: `components/Community.tsx`, `components/Footer.tsx`
- Modify: `app/page.tsx`

**Step 1: Build the Community component**

Create `components/Community.tsx`:
- Section with py-24
- Section header: "DEPARTMENTS" in small caps serif, centered, letter-spaced
- Three-column grid (md:grid-cols-3, gap-6)
- Each card has: department name (uppercase monospace, amber), then list of links

**Card 1 — BUREAU OF COMMUNICATIONS**
- "Official Dispatches" → `#` (X/Twitter placeholder)
- "The Burrow" → `#` (Telegram placeholder)
- "Inner Circle Chambers" → `#` (Discord placeholder)

**Card 2 — DIVISION OF RESEARCH**
- "The Prophecy" → scrolls to #prophecy
- "Oracle Historical Database" → `#` (CoinGecko placeholder)
- "Contract Audit" → `#` (Solscan placeholder)

**Card 3 — OFFICE OF ACQUISITIONS**
- "Acquire $HOGE" → `#` (Jupiter placeholder)
- "Acquire $HOGE" → `#` (Raydium placeholder)  
- "Hibernation Portal" → label with "COMING Q3 2026" badge, no link

Cards styled: border #1a1a2e, subtle hover glow, padding. Links in off-white with amber hover.

**Step 2: Build the Footer component**

Create `components/Footer.tsx`:
- Border-top #1a1a2e
- Centered layout, py-16
- "GROUNDHOGE DAY ECONOMIC AUTHORITY" — Playfair Display, text-lg, letter-spaced
- "Established 1883 · Gobbler's Knob, Pennsylvania" — monospace, text-xs, muted
- Disclaimer paragraph — text-xs, muted, max-w-2xl centered, generous line-height
- Final line, isolated, slightly brighter: "$HOGE is not a security. $HOGE is a shadow."
- Copyright: "© 2026 Groundhoge Day Economic Authority. All shadows reserved."

**Step 3: Add to page**

Import Community and Footer into `app/page.tsx`. Render after OracleTerminal.

**Step 4: Verify**

```bash
npm run dev
```

Expected: Three department cards, full footer with disclaimer, responsive on mobile.

**Step 5: Commit**

```bash
git add components/Community.tsx components/Footer.tsx app/page.tsx
git commit -m "feat: add community departments and government-style footer"
```

---

## Task 7: Polish, Responsive, Deploy

**Files:**
- Modify: all components as needed
- Create: `public/favicon.ico` (placeholder), `app/opengraph-image.tsx` (optional)

**Step 1: Responsive audit**

Check all sections at mobile (375px), tablet (768px), and desktop (1280px):
- Ticker bar: should scroll smoothly at all widths
- Hero: countdown digits should scale down on mobile (text-4xl on mobile, text-8xl on desktop)
- Prophecy: two columns on desktop, stacked on mobile
- Terminal: table should scroll horizontally on mobile
- Community: three columns on desktop, stacked on mobile

Fix any responsive issues.

**Step 2: Add subtle scroll-triggered animations**

Add fade-in-up animation to each section as it enters viewport. Use Intersection Observer in a small hook (`hooks/useInView.ts`). Keep it subtle — opacity 0 to 1, translateY 20px to 0, 600ms ease.

**Step 3: OG meta tags**

In `app/layout.tsx`, add Open Graph metadata:
- Title: "Groundhoge Day ($HOGE)"
- Description: "The world's first weather-dependent deflationary asset. Supply determined annually by one rodent."
- Site name: "Groundhoge Day Economic Authority"
- Type: website

**Step 4: Deploy to Vercel**

```bash
cd /Users/dougkvamme/projects/groundhogeday
npx vercel --prod
```

Link to the groundhogeday.com domain if not auto-linked.

**Step 5: Verify production**

Visit https://groundhogeday.com and confirm all sections render correctly.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: responsive polish, animations, OG tags, and production deploy"
```

---

## Summary

| Task | What | Est. |
|------|------|------|
| 1 | Next.js scaffold | Quick |
| 2 | Ticker bar | Quick |
| 3 | Hero + countdown clock | Medium |
| 4 | Prophecy (tokenomics) | Medium |
| 5 | Oracle terminal + history data | Medium-Large |
| 6 | Community + footer | Quick |
| 7 | Polish + deploy | Medium |

7 tasks, 7 commits, shipped to production.
