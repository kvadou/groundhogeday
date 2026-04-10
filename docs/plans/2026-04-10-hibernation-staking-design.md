# Hibernation Staking — Design Document

**Date:** 2026-04-10
**Status:** Approved
**Project:** Groundhoge Day ($HOGE)

---

## Overview

Users lock $HOGE in a program vault ("The Burrow") to earn Elixir rewards and gain automatic shadow burn protection. Rewards are funded by the 6.25% transfer fee — non-inflationary, self-sustaining.

## Staking Tiers

| Tier | Enum | Lock Period | Elixir Multiplier |
|------|------|-------------|-------------------|
| Light Sleep | `LightSleep` | 7 days | 1x |
| Deep Sleep | `DeepSleep` | 30 days | 2x |
| True Hibernation | `TrueHibernation` | 90 days | 5x |
| Permafrost | `Permafrost` | 365 days | 10x |

## Shadow Burn Protection

Staked tokens live in a program-owned vault PDA. The PermanentDelegate authority can only burn from user-owned token accounts. Staked tokens are automatically exempt — no extra logic required.

## Reward Distribution

- **Source:** 6.25% transfer fee withheld accounts
- **Flow:** Admin harvests withheld fees → deposits into reward vault via `fund_rewards`
- **Accrual:** Per-second, proportional: `(user_stake * multiplier / total_weighted_stake) * reward_rate_per_second`
- **Claiming:** Users can claim accrued rewards anytime (no lock on rewards, only on principal)
- **Unstaking:** Only after lock period expires. Returns principal + final reward claim.

## On-Chain Program: `groundhoge-hibernate`

### Accounts

```
HibernateConfig (PDA: seeds=["hibernate-config"])
├── admin: Pubkey
├── mint: Pubkey              // $HOGE mint
├── vault: Pubkey             // Program ATA holding staked $HOGE
├── reward_vault: Pubkey      // Program ATA holding fee rewards
├── total_staked: u64         // Raw total $HOGE locked
├── total_weighted: u64       // Sum of (stake * multiplier) across all positions
├── reward_rate: u64          // Rewards per second (raw units)
├── last_update_ts: i64       // Last time global state was updated
├── accumulated_per_weight: u128  // Accumulated rewards per unit of weighted stake (scaled)
└── bump: u8

StakePosition (PDA: seeds=["stake", user.key()])
├── owner: Pubkey
├── amount: u64               // Staked $HOGE (raw)
├── tier: HibernateTier       // Enum
├── multiplier: u8            // 1, 2, 5, or 10
├── weighted_amount: u64      // amount * multiplier
├── lock_start: i64           // Unix timestamp
├── lock_end: i64             // Unix timestamp
├── reward_debt: u128         // For reward math (scaled)
└── bump: u8
```

### Instructions

1. **`initialize(reward_rate: u64)`**
   - Admin-only. Creates HibernateConfig, vault ATA, reward vault ATA.
   - Sets initial reward rate.

2. **`stake(tier: HibernateTier, amount: u64)`**
   - Transfers $HOGE from user ATA → vault
   - Creates StakePosition PDA with lock_end = now + tier duration
   - Updates global total_staked, total_weighted, accumulated_per_weight
   - One position per wallet (simplicity)

3. **`claim()`**
   - Calculates: `pending = (position.weighted_amount * config.accumulated_per_weight) - position.reward_debt`
   - Transfers pending rewards from reward_vault → user ATA
   - Updates reward_debt

4. **`unstake()`**
   - Requires: `Clock::get().unix_timestamp >= position.lock_end`
   - Claims remaining rewards
   - Transfers staked $HOGE from vault → user ATA
   - Closes StakePosition account (rent returned to user)
   - Updates global totals

5. **`fund_rewards(amount: u64)`**
   - Admin-only. Transfers harvested transfer fees into reward_vault.
   - Updates accumulated_per_weight based on time elapsed and current total_weighted.

6. **`update_reward_rate(new_rate: u64)`**
   - Admin-only. Adjusts reward emission rate.
   - Settles accumulated_per_weight up to current timestamp first.

### Reward Math (SushiSwap MasterChef style)

```
On any state change (stake, unstake, claim, fund_rewards):
  elapsed = now - config.last_update_ts
  if total_weighted > 0:
    config.accumulated_per_weight += (elapsed * reward_rate * PRECISION) / total_weighted
  config.last_update_ts = now

Per-user pending rewards:
  pending = (position.weighted_amount * config.accumulated_per_weight / PRECISION) - position.reward_debt

On stake:
  position.reward_debt = position.weighted_amount * config.accumulated_per_weight / PRECISION

PRECISION = 1_000_000_000_000 (u128 to avoid rounding errors)
```

## Website UI: Hibernation Portal (`/hibernate`)

### Layout
- Top: user's current position (if any) — tier badge, amount staked, time remaining, accrued rewards
- Middle: tier selection cards (4 tiers, visual progression from drowsy groundhog to frozen)
- Bottom: stake amount input + execute button
- Claim rewards button always visible if rewards > 0

### States
- **No wallet:** "Connect wallet to enter the burrow"
- **No position:** Tier picker + amount input + stake button
- **Active position:** Position details + claim button + countdown to unlock
- **Unlocked position:** Position details + claim button + unstake button

## File Structure

```
solana/programs/groundhoge-hibernate/
├── Cargo.toml
├── Xargo.toml
└── src/
    ├── lib.rs          // Program entrypoint + all instructions
    ├── state.rs        // HibernateConfig, StakePosition, HibernateTier
    └── errors.rs       // Custom error codes

solana/scripts/
├── init-hibernate.ts   // Deploy + initialize config + vaults
└── fund-hibernate.ts   // Harvest fees + fund reward vault

app/hibernate/
└── page.tsx            // Hibernation Portal UI

components/
└── HibernatePanel.tsx  // Staking interface component

lib/
└── hibernate.ts        // Client-side: stake/claim/unstake tx builders
```

## Implementation Order

1. Anchor program (lib.rs, state.rs, errors.rs)
2. Build + deploy to devnet
3. Init script (init-hibernate.ts)
4. Fund script (fund-hibernate.ts) — harvest existing fees + deposit
5. Client library (lib/hibernate.ts)
6. UI (HibernatePanel.tsx + /hibernate page)
7. Integration test end-to-end on devnet
