# Phase 2 — Full Ecosystem Expansion

**Date:** 2026-04-10
**Status:** In Progress

---

## 1. AI Oracle Twitter Bot

**Status:** Content engine exists (`lib/oracle-bot.ts`, `/api/oracle-bot`). Need posting automation.

**Implementation:**
- Create `scripts/oracle-post.ts` — CLI script that calls generateTweet() and posts to X via API
- Need X API credentials (Doug to provide)
- Schedule via cron (daily or 2-3x/day)
- Bot persona: "@GroundhogeDayHQ" — posts prophecy dispatches, fun facts, rival alerts, countdown updates

**Blocked on:** X API credentials from Doug

---

## 2. $ELIXIR Token

**Lore:** The Elixir of Life extends Phil's lifespan by 7 years per sip. In-game, it's a companion token earned through staking.

**Mechanics:**
- Earn rate: 1 $ELIXIR per 7 weeks staked in Hibernation
- Utility option A: Bypass frostbite penalty (40% early withdrawal tax)
- Utility option B: Activate 7x yield multiplier for one staking cycle
- Non-transferable initially (soulbound to staker)

**Implementation:**
- New SPL token mint (on devnet first)
- Modify groundhoge-hibernate program to mint $ELIXIR on claim
- Add $ELIXIR balance display to /hibernate page
- Add "Use Elixir" buttons for bypass/multiplier options

**Page:** `/elixir` — dedicated page explaining the Elixir economy

---

## 3. Inner Circle NFTs

**Lore:** The Inner Circle is 15 top-hat-wearing men who run the ceremony. The Acacia Cane holder translates Groundhogese.

**Collection:**
- 15 NFTs total (1 per Inner Circle member)
- 1-of-1 "Acacia Cane" NFT with 6x governance vote multiplier
- Each NFT: unique title (President, Vice President, etc.), top hat artwork
- Holders get: governance votes on ceremony outcome, access to private channel

**Implementation:**
- Metaplex collection on Solana
- Metadata + artwork generation
- Mint page at `/inner-circle`
- On-chain attributes for vote multiplier

**Page:** `/inner-circle` — collection showcase, mint interface, member roster

---

## 4. Prediction Market

**Lore:** Betting on whether the Oracle sees his shadow.

**Mechanics:**
- Binary outcome: SHADOW vs NO SHADOW for Feb 2, 2027
- Could integrate with Polymarket or build simple on-chain prediction
- Resolution: tied to the ceremony API endpoint

**Implementation (MVP):**
- Page at `/predict` showing current odds, historical data
- Link out to Polymarket if they have a market, or
- Simple on-chain prediction pool (deposit SOL, pick side, winner takes pool)

---

## 5. Merch Store

**Implementation:**
- Page at `/merch` with product cards
- Link to print-on-demand service (Printful/Shopify)
- Products: "The Oracle Has Spoken" tee, "$HOGE is not a security. $HOGE is a shadow." tee, Inner Circle top hat, Whistle-Pig mug, "39% Accuracy" cap

---

## 6. Rival Groundhog Token Wars

**Concept:** Satirical "competitor analysis" page tracking fictional rival tokens.

**The Rivals:**
- $CHUCK — Staten Island Chuck token ("the violent fork")
- $BERT — Buffalo Bert token ("the rigged stablecoin — always pegged to shadow")
- $CASIMIR — Concord Casimir token ("the pierogi-backed derivative")
- $PHIL_DC — Potomac Phil token ("the dead token — literally taxidermied")

**Implementation:**
- Page at `/rivals` — satirical Bloomberg terminal showing fake rival tokens
- Fake price charts, fake market caps, fake "analyst reports"
- Each rival has a dossier card with absurd metrics
- All clearly fictional/satirical

---

## 7. DeSci Immortality Grant DAO

**Concept:** A satirical DAO funding "immortality research" for the Oracle.

**The Pitch:** "The Oracle has survived since 1887 through the Elixir of Life. But vodka, milk, eggs, and orange juice may not be sufficient for the next 140 years. The DeSci Immortality Grant funds cutting-edge research into marmot longevity."

**Implementation:**
- Page at `/dao` — treasury display, proposal list, "research papers"
- Fake proposals: "Grant #001: Elixir Formula Optimization", "Grant #002: Cryogenic Burrow Technology", "Grant #003: Groundhogese-to-English Neural Translation"
- Each proposal has fake vote counts, status, absurd research abstracts
- Treasury shows a fake balance with a "DONATE TO SCIENCE" button (links to $HOGE buy)

---

## Implementation Order

| Priority | Item | Effort | Dependencies |
|----------|------|--------|--------------|
| 1 | Merch page | Small | None — just a page |
| 2 | Rival Token Wars page | Small | None — satirical content |
| 3 | DeSci DAO page | Small | None — satirical content |
| 4 | Prediction Market page | Medium | Design decision on Polymarket vs custom |
| 5 | $ELIXIR page + token | Medium | Solana program changes |
| 6 | Inner Circle NFT page | Medium | Metaplex setup, artwork |
| 7 | AI Bot automation | Small code, blocked | X API creds from Doug |
