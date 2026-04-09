# Groundhoge Day — Session Handoff: Burrow Complete

**Date:** 2026-04-08
**Next session goal:** Wallet registration automation + website integration

---

## What's Done

### Token ($HOGE) — LIVE on Devnet
- **Mint:** `Cn1WQsxcExJFEcgJAXns3CL34CNjovJ4RXp3APzUQ7ZQ`
- **Admin:** `6S2NPTuDX6N8G7FCpNiwRLfRtcDH6qv7ABcKkBxCsNhX`
- **Decimals:** 2
- **Current supply:** ~1,839,050,780 $HOGE (after testing shadow burn + no-shadow mint)
- **Extensions:** TransferFeeConfig (6.25%), TransferHook, PermanentDelegate
- **Mint info:** `solana/mint-info.json`

### Transfer Hook Program — DEPLOYED
- **Program ID:** `BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU`
- **Features:** Daily sell limit (1,883 $HOGE/wallet/day), 109th tx trap, pause/unpause
- **Anchor version:** 0.31.1, Rust 1.94.1, Solana CLI 3.1.12
- **Source:** `solana/programs/groundhoge-hook/src/lib.rs`

### The Burrow (Custom AMM) — DEPLOYED + SEEDED
- **Program ID:** `4TJmU197oWhxmjSq5LR8fSvcgy3i6drXhP5zhNzKi9zi`
- **Pool PDA:** `4oC28QeV6G2qh6hFTEwLrwpuY1XkK74VGGQbnp5QMJpq`
- **Pool Authority:** `BLkBU9SEqAMyLYkSXXzortRBe2pdC7v5V6xEen8i2FSy`
- **Vault $HOGE:** `CrPko9yCEcTnw3gp5KF8zrzpTQpWmS6BbczaTkxK83Sk`
- **Vault WSOL:** `Ey4x4ASsSx2NBsRAq2cHEY934BLmcpw2EXKfuoveJApn`
- **Reserves:** 1,000 $HOGE + 0.1 SOL
- **Pool info:** `solana/pool-info.json`
- **Source:** `solana/programs/groundhoge-burrow/src/lib.rs`
- **Instructions:** `create_pool`, `sync_reserves`, `swap_sol_for_hoge`, `swap_hoge_for_sol`

### Admin Scripts — TESTED
- `npx ts-node scripts/admin-shadow.ts shadow` — 6% burn (tested, works)
- `npx ts-node scripts/admin-shadow.ts no-shadow` — 3.9% mint (tested, works)
- `npx ts-node scripts/admin-shadow.ts pause/unpause` — hook toggle (tested, works)
- `npx ts-node scripts/create-token.ts` — token creation (ran once)
- `npx ts-node scripts/init-burrow.ts` — pool setup (idempotent, ran successfully)

### Website — LIVE
- **URL:** https://groundhogeday.com (also groundhogeday-seven.vercel.app)
- **Stack:** Next.js 16, TypeScript, Tailwind CSS 4, Vercel
- **Project dir:** `/Users/dougkvamme/projects/groundhogeday/`

### Toolchain
- Anchor CLI 0.31.1, Rust 1.94.1, Solana CLI 3.1.12 (Agave)
- Keypair: `~/.config/solana/groundhoge-dev.json`
- Devnet balance: ~4.5 SOL (use https://faucet.solana.com if needed)
- PATH setup: `export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$HOME/.avm/bin:$PATH"`

---

## Known Issues / Technical Debt

### CPI + Transfer Hook
- **Direct Token-2022 transfers with hook work perfectly** (verified with debug-transfer.ts)
- **CPI from Anchor programs to Token-2022 with TransferHook fails** — "Unknown program" error when Token-2022 tries to call the hook during CPI. This affects the Burrow's swap instructions.
- **Workaround for seeding:** Transfer tokens directly to vaults + call `sync_reserves`
- **Swap workaround needed:** Either solve the CPI issue, or have swaps done as multi-instruction transactions (direct transfer + sync) with client-side atomicity
- **Root cause hypothesis:** Token-2022's transfer hook CPI resolution doesn't see the hook program as executable in nested CPI contexts. May need `invoke_signed` with explicit program account instead of Anchor's `token_interface::transfer_checked`

### Stack Overflow with Token-2022
- Anchor account structs with multiple `InterfaceAccount<TokenAccount>` for Token-2022 tokens blow the SBF stack
- **Fix:** Use `Box<InterfaceAccount<'info, TokenAccount>>` for all Token-2022 accounts

### Raydium Incompatibility
- Raydium CPMM hard-blocks TransferHook + PermanentDelegate extensions (`is_supported_mint` whitelist in their contract)
- **Mainnet path:** Apply for Orca Whirlpool TokenBadge (they support TransferHook with approval)

---

## Next Session Plan

### Task 1: Wallet Registration Automation
- Currently: wallets must call `register_wallet` before first $HOGE transfer
- Options:
  - **A) Bot/cranker:** Off-chain service that watches for new $HOGE token accounts and auto-registers them
  - **B) Client-side:** Website registers wallets when connecting
  - **C) Modify hook:** Make the hook not require pre-registration (use `UncheckedAccount` and handle uninitialized counters gracefully)
- Option C is cleanest — modify the hook to treat missing daily counters as "fresh wallet, counter = 0"

### Task 2: Website Integration
- Add wallet connect (Solana wallet adapter)
- Show live token stats from on-chain data:
  - Total supply
  - Global tx count (from GlobalCounter PDA)
  - Daily limit status for connected wallet
  - Pool reserves from The Burrow
- Link to Solana Explorer for all addresses
- Potential: basic swap UI for The Burrow

### Task 3 (if time): Solve CPI + Hook Issue
- Research `spl_transfer_hook_interface::onchain::invoke_transfer_checked` for proper CPI
- Or use raw `invoke_signed` instead of Anchor's `token_interface::transfer_checked`
- Test with a minimal reproduction before applying to The Burrow

---

## File Map

```
/Users/dougkvamme/projects/groundhogeday/
├── app/                      # Next.js website
├── components/               # React components
├── docs/plans/               # Design docs + handoffs
├── solana/
│   ├── Anchor.toml           # Workspace config
│   ├── Cargo.toml            # Rust workspace
│   ├── mint-info.json        # Token addresses
│   ├── pool-info.json        # Burrow pool addresses
│   ├── programs/
│   │   ├── groundhoge-hook/  # Transfer Hook program
│   │   └── groundhoge-burrow/# The Burrow AMM
│   ├── scripts/
│   │   ├── create-token.ts   # Token creation
│   │   ├── admin-shadow.ts   # Shadow burn/mint/pause
│   │   ├── init-burrow.ts    # Pool setup (idempotent)
│   │   └── debug-transfer.ts # Hook verification
│   └── target/
│       ├── deploy/           # .so files + keypairs
│       └── idl/              # Generated IDLs + TypeScript types
```

---

## IP/Legal Reminders
- NO "Punxsutawney Phil" (trademarked) — use "Phil", "The Oracle", "The Seer"
- NO Groundhog Day film references (Bill Murray, characters, quotes)
- All lore from real Groundhog Day holiday traditions (public domain)
