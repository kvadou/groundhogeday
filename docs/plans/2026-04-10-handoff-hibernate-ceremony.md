# Groundhoge Day — Session Handoff: Hibernate + Ceremony

**Date:** 2026-04-10
**Previous:** `2026-04-09-handoff-swap-ui-live.md`

---

## What's Done This Session

### Phase 1: Token Metadata (Metaplex)
- Uploaded logo to Arweave via Irys: `https://gateway.irys.xyz/Ecbm8yXYGLtrHun6BDjkQgz3FjSD9XReAVmLdDXGYTFG`
- Uploaded JSON metadata: `https://gateway.irys.xyz/E2Vxx8mYeBLGhV5zKpBTRWEcCir5FLV6bWn6YxUa9nKK`
- Created on-chain metadata account via Metaplex `createV1`
- $HOGE now shows "Groundhoge Day" with logo in wallets and Explorer

### Phase 2: Shadow Ceremony UI
- `/ceremony` — password-protected admin page
- Live YouTube embed with feed switcher + paste-any-URL
- Two dramatic buttons: SHADOW (6% burn) and NO SHADOW (3.9% mint)
- Confirmation modal → executing animation → result screen with Explorer link
- `/api/ceremony` — server-side route loads admin keypair, executes on-chain
- Auth: `CEREMONY_SECRET` env var (default: `groundhoge2026` in `.env.local`)
- **Tested:** Shadow burn executed successfully on devnet

### Phase 3: Hibernation Staking
- **Anchor program `groundhoge-hibernate`** — complete with all 6 instructions:
  - `initialize`, `stake`, `claim`, `unstake`, `fund_rewards`, `update_reward_rate`
  - MasterChef-style reward math (accumulated_per_weight)
  - TransferHook CPI via raw `invoke_signed` (same pattern as burrow)
- **Deployed to devnet:** `8udHGYeRaqNHAMeK3Br66q4mciViz8dL3D4rtPpUXD6q`
- **Initialized:** config, vault, reward vault PDAs created
- **Funded:** 937.5 $HOGE in reward vault (1000 sent, 6.25% fee)
- **Staking tested:** 100 $HOGE staked as LightSleep, position confirmed
- **Client library:** `lib/hibernate.ts` with tx builders, data fetchers, reward estimation
- **UI:** `/hibernate` page with tier selector, position view, live reward counter
- **Website deployed:** https://www.groundhogeday.com

---

## BLOCKER: Claim/Unstake Needs Redeploy

### What happened
The `claim` and `unstake` instructions used `anchor_spl::token_2022::transfer_checked` for reward payouts. This triggers the TransferHook but doesn't pass the hook's extra accounts, causing "missing account" errors.

### Fix applied (locally, not deployed)
Changed both to use `invoke_transfer_checked_with_hook` with `remaining_accounts` — same pattern that works for `stake` and `fund_rewards`. Code is compiled and committed.

### To deploy
Devnet SOL airdrop is rate-limited (2 per 8 hours). Need ~2.7 SOL for the buffer:

```bash
export PATH="$HOME/.cargo/bin:$HOME/.avm/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana airdrop 2 --keypair ~/.config/solana/groundhoge-dev.json --url devnet
cd solana && anchor deploy -p groundhoge-hibernate --provider.cluster devnet
cp target/idl/groundhoge_hibernate.json ../public/idl/
```

Then re-run the e2e test:
```bash
npx tsx scripts/test-hibernate.ts
```

### After deploy, also update client lib
The claim and unstake tx builders in `lib/hibernate.ts` need to pass `remainingAccounts` with hook extra accounts (same as buildStakeTransaction already does). Check `buildClaimTransaction` and `buildUnstakeTransaction`.

---

## Current Devnet State

### Programs
- **$HOGE Token:** `Cn1WQsxcExJFEcgJAXns3CL34CNjovJ4RXp3APzUQ7ZQ`
- **Transfer Hook:** `BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU`
- **The Burrow AMM:** `4TJmU197oWhxmjSq5LR8fSvcgy3i6drXhP5zhNzKi9zi`
- **Hibernate:** `8udHGYeRaqNHAMeK3Br66q4mciViz8dL3D4rtPpUXD6q` (needs redeploy)
- **Admin:** `6S2NPTuDX6N8G7FCpNiwRLfRtcDH6qv7ABcKkBxCsNhX`

### Hibernate PDAs
- Config: `F1SaGuSvCx757gLX5oMwzSJp2yaHqwmP54TaKFLaB5jW`
- Vault: `BYTWvtvekz8Xmdw5eaARKYSQxXTAJzvUdJfFgLxHDEzh`
- Reward Vault: `2fDPi8h3zFtCeTTr97coznZkoVXH6uNU6B8kDgBgQvsy`

### Active Position
- Admin has 100 $HOGE staked as LightSleep (unlocks 2026-04-17)

### Website
- **Live:** https://groundhogeday.com
- **New pages:** /ceremony, /hibernate
- **Env vars needed on Vercel:** `CEREMONY_SECRET`, `ADMIN_KEYPAIR`, `HOGE_MINT`

---

## Next Steps

### Immediate (next session)
1. **Redeploy hibernate program** (after airdrop rate limit resets)
2. **Test claim + unstake** end-to-end
3. **Fix client lib** — add remaining_accounts to claim/unstake tx builders
4. **Set Vercel env vars** for ceremony API

### Then
5. **Mainnet Prep** — from original handoff:
   - Apply for Orca Whirlpool TokenBadge
   - Audit contracts before mainnet
   - Set up mainnet keypair + funding
6. **Vercel GitHub Auto-Deploy** — connect `kvadou/groundhogeday` repo

---

## File Map (new files this session)

```
app/api/ceremony/route.ts       # Shadow ceremony API
app/ceremony/page.tsx            # Ceremony admin page
app/hibernate/page.tsx           # Hibernation portal page
components/HibernatePanel.tsx    # Staking UI component
lib/hibernate.ts                 # Client library for staking
public/idl/groundhoge_hibernate.json  # Hibernate IDL
solana/programs/groundhoge-hibernate/  # Anchor staking program
solana/scripts/create-metadata.ts      # Metaplex metadata script
solana/scripts/init-hibernate.ts       # Initialize hibernate
solana/scripts/fund-hibernate.ts       # Fund reward vault
solana/scripts/test-hibernate.ts       # E2E test
solana/hibernate-info.json             # Hibernate PDA addresses
.env.local                             # CEREMONY_SECRET + ADMIN_KEYPAIR
.gitleaksignore                        # Allow Solana addresses in docs
```
