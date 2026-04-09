# Groundhoge Day — Session Handoff: Wallet + Swap Live

**Date:** 2026-04-09
**Previous:** `2026-04-08-handoff-burrow-complete.md`

---

## What's Done This Session

### Task 1: Wallet Registration Automation (Option C)
- Modified transfer hook to use `UncheckedAccount` for `daily_counter` in `ExecuteHook`
- Unregistered wallets now gracefully bypass daily limit instead of failing
- Registered wallets still enforced normally via manual byte read/write
- Hook redeployed to devnet, verified with `test-unregistered.ts`

### Task 2: Website Integration
- Installed Solana wallet adapter (Phantom + Solflare)
- `WalletProvider` wraps the app via `layout.tsx`
- `WalletButton` in ticker bar — auto-registers wallet with hook on connect
- `ChainStats` section shows live devnet data (refreshes every 15s):
  - Total $HOGE supply
  - Global transaction count
  - Last trap (109th tx) status
  - Burrow vault balances ($HOGE + SOL)
  - Per-wallet daily transfer allowance (when connected)
- All stats link to Solana Explorer

### Task 3: CPI + Hook Issue — SOLVED
- **Root cause:** Anchor's `token_interface::transfer_checked` doesn't properly set up the CPI for Token-2022 TransferHook resolution
- **Fix:** Replaced with raw `invoke_signed` using a manually constructed `TransferChecked` instruction that includes all extra hook accounts
- **Key detail:** Authority must be marked `is_signer: true` in the instruction — `invoke_signed` provides the PDA signature at runtime
- Burrow redeployed, swap verified end-to-end with `test-swap.ts`

### Logo Update
- New logo: `public/logo-hoge.jpg` (groundhog with H coin design)
- Updated `app/icon.png` (180x180 PNG) and `app/favicon.ico` (32x32 PNG)
- Hero component updated to use new logo
- OG image updated

---

## Current Devnet State

### Token ($HOGE)
- **Mint:** `Cn1WQsxcExJFEcgJAXns3CL34CNjovJ4RXp3APzUQ7ZQ`
- **Supply:** ~1,839,050,780 (after testing)
- **Extensions:** TransferFeeConfig (6.25%), TransferHook, PermanentDelegate

### Transfer Hook
- **Program ID:** `BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU`
- **Status:** Upgraded — handles unregistered wallets gracefully

### The Burrow (AMM)
- **Program ID:** `4TJmU197oWhxmjSq5LR8fSvcgy3i6drXhP5zhNzKi9zi`
- **Status:** Upgraded — CPI swaps with TransferHook working
- **Pool reserves:** ~937.5 $HOGE + ~0.102 SOL (after test swap)

### Website
- **URL:** https://groundhogeday.com (Vercel)
- **Local:** `npm run dev` → http://localhost:3000
- **New features:** Wallet connect, live chain stats, new logo

---

## Next Steps

### Short-term
1. **Deploy to Vercel** — Push changes, verify wallet adapter works in production
2. **Swap UI** — Add basic swap interface on the website (buy/sell through The Burrow)
3. **Token metadata** — Upload token metadata + logo to Metaplex for Explorer display

### Medium-term
4. **Mainnet prep** — Apply for Orca Whirlpool TokenBadge (they support TransferHook)
5. **Shadow ceremony automation** — Cron job for Feb 2 shadow burn/mint execution
6. **Staking/hibernation** — Lock $HOGE for yield multiplier

---

## Files Changed

```
solana/programs/groundhoge-hook/src/lib.rs      — UncheckedAccount for daily_counter
solana/programs/groundhoge-burrow/src/lib.rs     — invoke_signed CPI fix for TransferHook
components/WalletProvider.tsx                     — NEW: Solana wallet context
components/WalletButton.tsx                       — NEW: Connect button + auto-registration
components/ChainStats.tsx                         — NEW: Live on-chain stats
hooks/useChainStats.ts                            — NEW: Chain data fetching hook
lib/solana.ts                                     — NEW: Constants + formatters
components/TickerBar.tsx                           — Added wallet button
app/layout.tsx                                    — Wrapped with WalletProvider
app/page.tsx                                      — Added ChainStats section
components/Hero.tsx                               — New logo
app/icon.png, app/favicon.ico                     — New favicon
public/logo-hoge.jpg, public/og-image.jpg         — New logo assets
solana/scripts/test-unregistered.ts               — NEW: Hook test
solana/scripts/test-swap.ts                       — NEW: Swap test
```
