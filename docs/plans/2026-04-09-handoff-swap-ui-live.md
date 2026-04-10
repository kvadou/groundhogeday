# Groundhoge Day — Session Handoff: Swap UI Live

**Date:** 2026-04-09
**Previous:** `2026-04-09-handoff-wallet-swap-live.md`

---

## What's Done This Session

### Task 1: Wallet Registration Automation
- Transfer hook uses `UncheckedAccount` for `daily_counter` — unregistered wallets bypass daily limit gracefully
- Hook redeployed to devnet, verified with `test-unregistered.ts`

### Task 2: Website Integration
- Wallet adapter (Phantom + Solflare) with auto-registration on connect
- Live on-chain stats (supply, tx count, vault balances, daily allowance)
- All stats link to Solana Explorer, refresh every 15s

### Task 3: CPI + Hook Fix — SOLVED
- Root cause: Anchor's `token_interface::transfer_checked` doesn't set up CPI for TransferHook
- Fix: raw `invoke_signed` with manually constructed TransferChecked instruction
- Authority must be `is_signer: true` in instruction — invoke_signed provides PDA sig
- Helper: `invoke_transfer_checked_with_hook()` in Burrow program

### Task 4: Swap UI
- `lib/swap.ts` — shared engine: quote calculation (mirrors on-chain x*y=k math), transaction building, hook account resolution, WSOL wrap/unwrap
- `components/SwapPanel.tsx` — visual form: BUY/SELL toggle, amount input, live quote with price impact + fees, slippage selector (0.5/1/2/5%), execute button, tx confirmation link
- `components/OracleTerminal.tsx` — interactive terminal: `buy`, `sell`, `quote`, `reserves`, `help` commands with custom slippage support
- IDL served from `public/idl/groundhoge_burrow.json` for client-side Anchor

### Logo + Favicon
- New groundhog+H coin logo everywhere
- Circular favicon with transparent background (no white border)

### Vercel Deployment Fixed
- Project linked to `dougkvamme-gmailcoms-projects` scope (personal account)
- Deploy workflow: `vercel pull --yes && vercel build --prod && vercel deploy --prebuilt --prod --archive=tgz`
- GitHub repo: `kvadou/groundhogeday` (private)
- GitHub connection attempted but may need manual setup at Vercel → Settings → Git

---

## Current State

### Devnet Programs
- **$HOGE Token:** `Cn1WQsxcExJFEcgJAXns3CL34CNjovJ4RXp3APzUQ7ZQ`
- **Transfer Hook:** `BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU` (handles unregistered wallets)
- **The Burrow AMM:** `4TJmU197oWhxmjSq5LR8fSvcgy3i6drXhP5zhNzKi9zi` (CPI swaps working)
- **Admin:** `6S2NPTuDX6N8G7FCpNiwRLfRtcDH6qv7ABcKkBxCsNhX`
- Toolchain: Anchor 0.31.1, Rust 1.94.1, Solana CLI 3.1.12

### Website
- **Live:** https://groundhogeday.com
- **Vercel project:** `dougkvamme-gmailcoms-projects/groundhogeday`
- **Stack:** Next.js 16, TypeScript, Tailwind CSS 4, @solana/wallet-adapter, @coral-xyz/anchor

---

## Next Steps (for next session)

### 1. Token Metadata (Metaplex)
- Upload logo + metadata so $HOGE shows properly in wallets and Solana Explorer
- Use `@metaplex-foundation/mpl-token-metadata` or Metaplex CLI
- Metadata: name "Groundhoge Day", symbol "$HOGE", image (upload logo to Arweave/IPFS)

### 2. Shadow Ceremony Automation
- Cron job or scheduled script for Feb 2 each year
- Reads weather data / ceremony result
- Calls `admin-shadow.ts shadow` (6% burn) or `admin-shadow.ts no-shadow` (3.9% mint)
- Could use Vercel Cron, GitHub Actions, or Clockwork on Solana

### 3. Staking / Hibernation Portal
- Lock $HOGE for yield multiplier
- Referenced as "COMING Q3 2026" on the website
- Needs new Anchor program or extension to existing hook

### 4. Mainnet Prep
- Apply for Orca Whirlpool TokenBadge (they support TransferHook with approval)
- Raydium is NOT an option (hard-blocks TransferHook + PermanentDelegate)
- Audit contracts before mainnet deploy
- Set up mainnet keypair + funding

### 5. Vercel GitHub Auto-Deploy
- May still need manual setup: Vercel → Settings → Git → connect `kvadou/groundhogeday`
- Currently deploying via CLI (`vercel deploy --prebuilt --prod --archive=tgz`)

---

## File Map

```
/Users/dougkvamme/projects/groundhogeday/
├── app/
│   ├── layout.tsx              # WalletProvider wrapper
│   ├── page.tsx                # All sections including SwapPanel
│   ├── favicon.ico             # Circular transparent PNG
│   └── icon.png                # 180x180 app icon
├── components/
│   ├── SwapPanel.tsx           # Visual swap form (BUY/SELL)
│   ├── ChainStats.tsx          # Live on-chain stats
│   ├── WalletButton.tsx        # Connect + auto-register
│   ├── WalletProvider.tsx      # Solana wallet context
│   ├── OracleTerminal.tsx      # Shadow history + terminal commands
│   ├── Hero.tsx                # Logo + countdown
│   ├── Prophecy.tsx            # Tokenomics scenarios
│   ├── CountdownClock.tsx      # Feb 2 countdown
│   ├── Community.tsx           # Department links
│   ├── TickerBar.tsx           # Scrolling ticker + wallet button
│   └── Footer.tsx
├── hooks/
│   ├── useChainStats.ts        # On-chain data fetching
│   └── useInView.ts            # Scroll animation
├── lib/
│   ├── solana.ts               # Constants + formatters
│   ├── swap.ts                 # Swap engine (quotes, tx builder)
│   └── shadow-history.ts       # Historical prediction data
├── public/
│   ├── idl/groundhoge_burrow.json  # Burrow IDL for client
│   ├── logo-hoge.jpg           # Main logo
│   └── og-image.jpg            # OpenGraph image
├── solana/
│   ├── programs/
│   │   ├── groundhoge-hook/    # Transfer Hook (daily limit + 109th trap)
│   │   └── groundhoge-burrow/  # The Burrow AMM (x*y=k)
│   ├── scripts/                # Admin + test scripts
│   ├── mint-info.json          # Token addresses
│   └── pool-info.json          # Pool addresses
└── docs/plans/                 # Design docs + handoffs
```
