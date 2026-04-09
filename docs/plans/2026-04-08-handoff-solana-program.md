# Groundhoge Day — Session Handoff: Solana Program Build

**Date:** 2026-04-08
**Next session goal:** Build and deploy the $HOGE Token-2022 token + Transfer Hook program on Solana devnet

---

## What's Done

### Website (LIVE)
- **Site:** https://groundhogeday.com (also https://groundhogeday-seven.vercel.app)
- **Domain:** groundhogeday.com registered via Vercel ($11.25/yr)
- **Note:** Domain may need re-pointing in Vercel dashboard — latest deploy is on `doug-kvammes-projects` scope, domain was purchased under a different scope. The vercel.app URL works; custom domain may still serve old deploy.
- **Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Vercel
- **Project dir:** `/Users/dougkvamme/projects/groundhogeday/`
- **Git:** 9 commits on `main`, no remote repo yet
- **Sections:** Ticker bar, Hero + countdown clock, Prophecy (tokenomics), Oracle Terminal (140 years of data), Community departments, Government-style footer
- **Logo:** Corporate Seal integrated (`public/logo-seal.jpg`), favicon + OG image generated
- **Design doc:** `docs/plans/2026-04-08-groundhogeday-site-design.md`

### Toolchain (INSTALLED)
- **Rust:** 1.94.1
- **Solana CLI:** 3.1.12 (Agave)
- **Anchor:** 0.30.1 (via avm)
- **Solana config:** devnet, keypair at `~/.config/solana/groundhoge-dev.json`
- **Dev pubkey:** `6S2NPTuDX6N8G7FCpNiwRLfRtcDH6qv7ABcKkBxCsNhX`
- **Devnet balance:** 5 SOL

### Research (NotebookLM)
- Notebook: "Groundhoge Day — Absurd Tokenomics Research" (ID: 630622e1)
- Notebook: "Groundhoge Day — Solana Token Launch Research" (ID: 50e2a476)
- 55+ sources on Token-2022, transfer hooks, meme coin mechanics

---

## Token Architecture

### Token-2022 Extensions Required

| Extension | Purpose | Config |
|-----------|---------|--------|
| **TransferFeeConfig** | 6.25% tax on every trade | feeBasisPoints: 625, maxFee: TBD |
| **PermanentDelegate** | Burn 6% from ALL wallets on Shadow Day | Set to admin keypair |
| **TransferHook** | Daily sell limit + 109th tx trap | Points to custom Anchor program |
| **Mint Authority** | Retained (not revoked) | For 3.9% annual mint on No Shadow Day |

### Custom Anchor Program (Transfer Hook)

Must implement:
1. **Daily sell limit:** Track per-wallet 24hr transfer volume via PDA counter. Reject if > 1,883 tokens. Reset at 7:25 AM EST.
2. **109th transaction trap:** Global counter PDA. Every 109th transfer gets 99% taxed to liquidity pool (requires pre-approved delegate).
3. **ExtraAccountMetaList:** Pass counter PDAs into the hook.

Key constraint: Transfer hooks receive all accounts as **read-only** except the extra accounts you define. Can't directly debit sender — need delegate pattern or revert.

### Token Creation Sequence (ORDER MATTERS)

1. Deploy Transfer Hook program first (get Program ID)
2. Create mint account with calculated space for all 3 extensions
3. Initialize extensions BEFORE mint (can't add after):
   - InitializeTransferFeeConfig
   - InitializeTransferHook
   - InitializePermanentDelegate
4. Initialize Mint
5. Initialize ExtraAccountMetas (hook counter PDAs)
6. Mint initial supply: 1,883,000,000 (with 2 decimals = 188,300,000,000 raw units)

### After Token Creation

7. Create Raydium liquidity pool ($HOGE/SOL)
8. Build admin instruction for Feb 2 shadow trigger (burn 6% OR mint 3.9%)

---

## Tokenomics Reference (Legal-Scrubbed)

| Property | Value | Lore Source |
|----------|-------|-------------|
| Ticker | $HOGE | Groundhog + Doge |
| Chain | Solana (Token-2022) | - |
| Initial supply | 1,883,000,000 | Phil's birth year (1883) |
| Decimal places | 2 | February 2nd |
| Shadow burn | 6.00% of circulating | 6 weeks of winter |
| No-shadow mint | 3.90% new supply | Phil's 39% accuracy |
| Daily sell limit | 1,883 tokens/wallet | Birth year |
| Sell limit reset | 7:25 AM EST | Punxsutawney sunrise Feb 2 |
| Transaction tax | 6.25% total | Feb 2 + leap year |
| Tax split | 2% stakers / 2% liquidity / 2.25% burn | - |
| 109th tx trap | 99% tax to liquidity | Phil's 109 shadow predictions |
| callChuck() | Anti-MEV hidden function | Staten Island Chuck |

### Phase 2 Features (NOT in initial build)
- Hibernation staking (42-day lockup, 40% frostbite penalty)
- $ELIXIR secondary token
- Inner Circle DAO (15 NFTs + Acacia Cane)
- 1943 War Clouds protocol (death/cancel edge case)
- Oracle of Gobbler's Knob AI Twitter bot
- Merch store

---

## Next Session Plan

### Phase 1: Transfer Hook Program
1. `anchor init groundhoge-hook` in project dir
2. Implement transfer hook interface (Execute + InitializeExtraAccountMetaList)
3. Add daily sell limit logic (per-wallet PDA counter)
4. Add 109th transaction counter (global PDA)
5. Test on localnet
6. Deploy to devnet

### Phase 2: Token Creation Script
1. TypeScript script using @solana/web3.js + @solana/spl-token
2. Create mint with all 3 extensions
3. Mint initial supply
4. Verify on Solana Explorer

### Phase 3: Liquidity + Admin
1. Create Raydium devnet pool
2. Build admin instruction for shadow/no-shadow trigger
3. Test full flow: trade → tax → sell limit → shadow burn

### Simplification Option
If the Transfer Hook adds too much complexity for v1, we could launch with just:
- TransferFeeConfig (6.25% tax) ← built-in, no custom code
- PermanentDelegate (for shadow burns) ← built-in, no custom code  
- Retained mint authority (for no-shadow mints) ← built-in

And add the Transfer Hook (sell limits, 109th trap) as a v2 upgrade. This gets the token live faster.

---

## IP/Legal Reminders
- NO "Punxsutawney Phil" (trademarked) — use "Phil", "The Oracle", "The Seer"
- NO Groundhog Day film references (Bill Murray, characters, quotes)
- All lore from real Groundhog Day holiday traditions (public domain)
