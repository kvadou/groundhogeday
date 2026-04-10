# Hibernation Staking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a staking program where users lock $HOGE in tiers (7d/30d/90d/365d) to earn transfer-fee-funded rewards with multipliers, plus automatic shadow burn protection.

**Architecture:** New Anchor program `groundhoge-hibernate` using MasterChef-style reward math (accumulated-per-weight). Staked tokens go to a program vault PDA (exempt from PermanentDelegate burns). Admin harvests 6.25% transfer fees into a reward vault. Frontend at `/hibernate`.

**Tech Stack:** Anchor 0.31.1, Rust, Token-2022 (spl-token via anchor-spl), TypeScript, Next.js 16, Tailwind CSS 4

**Toolchain:** PATH must include `~/.avm/bin` and `~/.local/share/solana/install/active_release/bin`. Run: `export PATH="$HOME/.avm/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"` before any `anchor` or `solana` commands.

**Existing patterns to follow:**
- See `solana/programs/groundhoge-burrow/src/lib.rs` for account struct style, error codes, Token-2022 usage
- See `solana/programs/groundhoge-burrow/Cargo.toml` for dependency versions (anchor-lang 0.31.1, anchor-spl 0.31.1)
- See `solana/scripts/init-burrow.ts` for init script patterns
- See `lib/swap.ts` for client-side tx building patterns
- See `components/SwapPanel.tsx` for UI component patterns
- Token mint: `Cn1WQsxcExJFEcgJAXns3CL34CNjovJ4RXp3APzUQ7ZQ` (Token-2022 with TransferHook)
- Admin keypair: `~/.config/solana/groundhoge-dev.json`
- Anchor workspace: `solana/Anchor.toml` — add new program to `[programs.devnet]` and `[programs.localnet]`

**IMPORTANT — Token-2022 TransferHook CPI:**
Staking involves transferring $HOGE which triggers the TransferHook. The burrow program solved this with a raw `invoke_signed` helper (`invoke_transfer_checked_with_hook`). The hibernate program MUST use the same approach — Anchor's `token_interface::transfer_checked` does NOT work for CPI when TransferHook is involved. Copy the helper from `groundhoge-burrow/src/lib.rs:191-250` and use `remaining_accounts` for hook extra accounts.

---

### Task 1: Scaffold Anchor Program

**Files:**
- Create: `solana/programs/groundhoge-hibernate/Cargo.toml`
- Create: `solana/programs/groundhoge-hibernate/Xargo.toml`
- Create: `solana/programs/groundhoge-hibernate/src/lib.rs` (empty entrypoint)
- Modify: `solana/Anchor.toml` (add program)

**Step 1: Create Cargo.toml**

```toml
[package]
name = "groundhoge-hibernate"
version = "0.1.0"
description = "Hibernation Portal — $HOGE staking with tiered Elixir rewards"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "groundhoge_hibernate"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []
idl-build = ["anchor-lang/idl-build", "anchor-spl/idl-build"]

[dependencies]
anchor-lang = { version = "0.31.1", features = ["init-if-needed"] }
anchor-spl = "0.31.1"
```

**Step 2: Create Xargo.toml**

```toml
[target.bpfel-unknown-unknown.dependencies.std]
features = []
```

**Step 3: Create minimal lib.rs**

```rust
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod groundhoge_hibernate {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

**Step 4: Add to Anchor.toml**

Add under both `[programs.localnet]` and `[programs.devnet]`:
```
groundhoge_hibernate = "11111111111111111111111111111111"
```

(Placeholder ID — will be replaced after first `anchor build` generates a keypair.)

**Step 5: Build to verify scaffold**

```bash
export PATH="$HOME/.avm/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"
cd solana && anchor build -p groundhoge-hibernate
```

Expected: Compiles successfully. A keypair is generated at `solana/target/deploy/groundhoge_hibernate-keypair.json`.

**Step 6: Update program ID**

```bash
solana address -k target/deploy/groundhoge_hibernate-keypair.json
```

Replace `declare_id!("11111111111111111111111111111111")` in lib.rs and both entries in Anchor.toml with the actual key.

**Step 7: Rebuild with correct ID**

```bash
anchor build -p groundhoge-hibernate
```

**Step 8: Commit**

```bash
git add programs/groundhoge-hibernate/ Anchor.toml
git commit -m "feat(hibernate): scaffold anchor program"
```

---

### Task 2: State Accounts + Error Codes

**Files:**
- Modify: `solana/programs/groundhoge-hibernate/src/lib.rs`

**Step 1: Write full state, enums, and errors**

Replace the entire lib.rs content with:

```rust
use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::Token2022,
    token_interface::{Mint, TokenAccount},
};
use anchor_lang::solana_program::program::invoke_signed;

declare_id!("ACTUAL_PROGRAM_ID_HERE");

// ── Seeds ─────────────────────────────────────────────────────────────
const CONFIG_SEED: &[u8] = b"hibernate-config";
const VAULT_SEED: &[u8] = b"hibernate-vault";
const REWARD_VAULT_SEED: &[u8] = b"hibernate-rewards";
const STAKE_SEED: &[u8] = b"stake";

/// Precision multiplier for accumulated_per_weight math (u128)
const PRECISION: u128 = 1_000_000_000_000;

// ── Tier Definitions ──────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum HibernateTier {
    LightSleep,      // 7 days, 1x
    DeepSleep,       // 30 days, 2x
    TrueHibernation, // 90 days, 5x
    Permafrost,      // 365 days, 10x
}

impl HibernateTier {
    pub fn lock_seconds(&self) -> i64 {
        match self {
            HibernateTier::LightSleep => 7 * 86_400,
            HibernateTier::DeepSleep => 30 * 86_400,
            HibernateTier::TrueHibernation => 90 * 86_400,
            HibernateTier::Permafrost => 365 * 86_400,
        }
    }

    pub fn multiplier(&self) -> u8 {
        match self {
            HibernateTier::LightSleep => 1,
            HibernateTier::DeepSleep => 2,
            HibernateTier::TrueHibernation => 5,
            HibernateTier::Permafrost => 10,
        }
    }
}

// ── State ─────────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct HibernateConfig {
    pub admin: Pubkey,
    pub mint: Pubkey,
    pub vault: Pubkey,
    pub reward_vault: Pubkey,
    pub total_staked: u64,
    pub total_weighted: u64,
    pub reward_rate: u64,           // rewards per second (raw token units)
    pub last_update_ts: i64,
    pub accumulated_per_weight: u128,
    pub bump: u8,
    pub vault_bump: u8,
    pub reward_vault_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct StakePosition {
    pub owner: Pubkey,
    pub amount: u64,
    pub tier: HibernateTier,
    pub multiplier: u8,
    pub weighted_amount: u64,
    pub lock_start: i64,
    pub lock_end: i64,
    pub reward_debt: u128,
    pub bump: u8,
}

// ── Errors ────────────────────────────────────────────────────────────

#[error_code]
pub enum HibernateError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Lock period has not expired")]
    LockNotExpired,
    #[msg("No rewards to claim")]
    NoRewards,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Position already exists — unstake first")]
    PositionExists,
    #[msg("Insufficient reward vault balance")]
    InsufficientRewards,
}

// ── Program ───────────────────────────────────────────────────────────

#[program]
pub mod groundhoge_hibernate {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

// ── Placeholder account contexts ──────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize {}
```

**Step 2: Build to verify state compiles**

```bash
cd solana && anchor build -p groundhoge-hibernate
```

Expected: Compiles cleanly.

**Step 3: Commit**

```bash
git add programs/groundhoge-hibernate/src/lib.rs
git commit -m "feat(hibernate): add state accounts, tiers, and error codes"
```

---

### Task 3: Initialize Instruction

**Files:**
- Modify: `solana/programs/groundhoge-hibernate/src/lib.rs`

**Step 1: Replace the initialize instruction and add its account context**

Replace the placeholder `initialize` function body and `Initialize` struct:

```rust
pub fn initialize(ctx: Context<InitializeHibernate>, reward_rate: u64) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.admin = ctx.accounts.admin.key();
    config.mint = ctx.accounts.mint.key();
    config.vault = ctx.accounts.vault.key();
    config.reward_vault = ctx.accounts.reward_vault.key();
    config.total_staked = 0;
    config.total_weighted = 0;
    config.reward_rate = reward_rate;
    config.last_update_ts = Clock::get()?.unix_timestamp;
    config.accumulated_per_weight = 0;
    config.bump = ctx.bumps.config;
    config.vault_bump = ctx.bumps.vault;
    config.reward_vault_bump = ctx.bumps.reward_vault;

    msg!("Hibernation Portal initialized. Reward rate: {} per second", reward_rate);
    Ok(())
}
```

Account context:

```rust
#[derive(Accounts)]
pub struct InitializeHibernate<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init, payer = admin, space = 8 + HibernateConfig::INIT_SPACE,
        seeds = [CONFIG_SEED], bump,
    )]
    pub config: Account<'info, HibernateConfig>,

    pub mint: InterfaceAccount<'info, Mint>,

    /// Vault to hold staked $HOGE — PDA-owned token account
    #[account(
        init, payer = admin,
        seeds = [VAULT_SEED, mint.key().as_ref()], bump,
        token::mint = mint,
        token::authority = vault,
        token::token_program = token_2022_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    /// Reward vault — holds fee-sourced rewards
    #[account(
        init, payer = admin,
        seeds = [REWARD_VAULT_SEED, mint.key().as_ref()], bump,
        token::mint = mint,
        token::authority = reward_vault,
        token::token_program = token_2022_program,
    )]
    pub reward_vault: InterfaceAccount<'info, TokenAccount>,

    pub token_2022_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}
```

**Step 2: Build**

```bash
cd solana && anchor build -p groundhoge-hibernate
```

**Step 3: Commit**

```bash
git add programs/groundhoge-hibernate/src/lib.rs
git commit -m "feat(hibernate): add initialize instruction with vault PDAs"
```

---

### Task 4: Stake Instruction

**Files:**
- Modify: `solana/programs/groundhoge-hibernate/src/lib.rs`

**Step 1: Add the `update_accumulated` helper function (above `#[program]`)**

```rust
fn update_accumulated(config: &mut HibernateConfig, now: i64) {
    if config.total_weighted > 0 {
        let elapsed = (now - config.last_update_ts) as u128;
        let new_rewards = elapsed * (config.reward_rate as u128) * PRECISION;
        config.accumulated_per_weight = config
            .accumulated_per_weight
            .checked_add(new_rewards / (config.total_weighted as u128))
            .unwrap_or(config.accumulated_per_weight);
    }
    config.last_update_ts = now;
}
```

**Step 2: Add the `invoke_transfer_checked_with_hook` helper**

Copy directly from `groundhoge-burrow/src/lib.rs:191-250`. This is the raw `invoke_signed` wrapper needed for Token-2022 TransferHook CPI. Place it after `update_accumulated`.

```rust
fn invoke_transfer_checked_with_hook<'info>(
    token_2022_program: &AccountInfo<'info>,
    source: &AccountInfo<'info>,
    mint: &AccountInfo<'info>,
    destination: &AccountInfo<'info>,
    authority: &AccountInfo<'info>,
    extra_accounts: &[AccountInfo<'info>],
    amount: u64,
    decimals: u8,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    use anchor_lang::solana_program::instruction::{AccountMeta, Instruction};

    let mut data = Vec::with_capacity(10);
    data.push(12u8);
    data.extend_from_slice(&amount.to_le_bytes());
    data.push(decimals);

    let mut accounts = vec![
        AccountMeta::new(*source.key, false),
        AccountMeta::new_readonly(*mint.key, false),
        AccountMeta::new(*destination.key, false),
        AccountMeta::new_readonly(*authority.key, true),
    ];

    for ai in extra_accounts {
        if ai.is_writable {
            accounts.push(AccountMeta::new(*ai.key, ai.is_signer));
        } else {
            accounts.push(AccountMeta::new_readonly(*ai.key, ai.is_signer));
        }
    }

    let ix = Instruction {
        program_id: *token_2022_program.key,
        accounts,
        data,
    };

    let mut account_infos = vec![
        source.clone(),
        mint.clone(),
        destination.clone(),
        authority.clone(),
    ];
    for ai in extra_accounts {
        account_infos.push(ai.clone());
    }
    account_infos.push(token_2022_program.clone());

    invoke_signed(&ix, &account_infos, signer_seeds)
        .map_err(|e| anchor_lang::prelude::ProgramError::from(e))?;

    Ok(())
}
```

**Step 3: Add stake instruction in the program module**

```rust
pub fn stake<'info>(
    ctx: Context<'_, '_, 'info, 'info, Stake<'info>>,
    tier: HibernateTier,
    amount: u64,
) -> Result<()> {
    require!(amount > 0, HibernateError::InvalidAmount);

    let now = Clock::get()?.unix_timestamp;
    let config = &mut ctx.accounts.config;
    update_accumulated(config, now);

    let multiplier = tier.multiplier();
    let weighted = amount
        .checked_mul(multiplier as u64)
        .ok_or(HibernateError::MathOverflow)?;

    // Transfer $HOGE from user to vault (with TransferHook support)
    let remaining = ctx.remaining_accounts.to_vec();
    let decimals = ctx.accounts.mint.decimals;

    invoke_transfer_checked_with_hook(
        &ctx.accounts.token_2022_program.to_account_info(),
        &ctx.accounts.user_hoge.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.vault.to_account_info(),
        &ctx.accounts.user.to_account_info(),
        &remaining,
        amount,
        decimals,
        &[], // user signs directly
    )?;

    // Init position
    let position = &mut ctx.accounts.position;
    position.owner = ctx.accounts.user.key();
    position.amount = amount;
    position.tier = tier;
    position.multiplier = multiplier;
    position.weighted_amount = weighted;
    position.lock_start = now;
    position.lock_end = now + tier.lock_seconds();
    position.reward_debt = (weighted as u128)
        .checked_mul(config.accumulated_per_weight)
        .ok_or(HibernateError::MathOverflow)?
        / PRECISION;
    position.bump = ctx.bumps.position;

    // Update global totals
    config.total_staked = config
        .total_staked
        .checked_add(amount)
        .ok_or(HibernateError::MathOverflow)?;
    config.total_weighted = config
        .total_weighted
        .checked_add(weighted)
        .ok_or(HibernateError::MathOverflow)?;

    msg!(
        "Entered hibernation: {} $HOGE, tier {:?}, locked until {}",
        amount,
        tier,
        position.lock_end
    );
    Ok(())
}
```

**Step 4: Add Stake account context**

```rust
#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED], bump = config.bump,
    )]
    pub config: Account<'info, HibernateConfig>,

    #[account(
        init, payer = user, space = 8 + StakePosition::INIT_SPACE,
        seeds = [STAKE_SEED, user.key().as_ref()], bump,
    )]
    pub position: Account<'info, StakePosition>,

    #[account(constraint = mint.key() == config.mint)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [VAULT_SEED, mint.key().as_ref()], bump = config.vault_bump,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(mut, token::mint = mint, token::authority = user)]
    pub user_hoge: InterfaceAccount<'info, TokenAccount>,

    pub token_2022_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}
```

**Step 5: Build**

```bash
cd solana && anchor build -p groundhoge-hibernate
```

**Step 6: Commit**

```bash
git add programs/groundhoge-hibernate/src/lib.rs
git commit -m "feat(hibernate): add stake instruction with TransferHook CPI"
```

---

### Task 5: Claim + Unstake + Fund Rewards + Update Rate Instructions

**Files:**
- Modify: `solana/programs/groundhoge-hibernate/src/lib.rs`

**Step 1: Add `calculate_pending` helper**

```rust
fn calculate_pending(position: &StakePosition, config: &HibernateConfig) -> Result<u64> {
    let gross = (position.weighted_amount as u128)
        .checked_mul(config.accumulated_per_weight)
        .ok_or(HibernateError::MathOverflow)?
        / PRECISION;
    let pending = gross.saturating_sub(position.reward_debt);
    Ok(pending as u64)
}
```

**Step 2: Add claim instruction**

```rust
pub fn claim(ctx: Context<Claim>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let config = &mut ctx.accounts.config;
    update_accumulated(config, now);

    let position = &ctx.accounts.position;
    let pending = calculate_pending(position, config)?;
    require!(pending > 0, HibernateError::NoRewards);

    // Transfer rewards from reward vault to user
    let mint_key = config.mint;
    let reward_bump = config.reward_vault_bump;
    let bump_bytes = [reward_bump];
    let signer_seeds: &[&[&[u8]]] = &[&[REWARD_VAULT_SEED, mint_key.as_ref(), &bump_bytes]];

    anchor_spl::token_2022::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_2022_program.to_account_info(),
            anchor_spl::token_2022::TransferChecked {
                from: ctx.accounts.reward_vault.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.user_hoge.to_account_info(),
                authority: ctx.accounts.reward_vault.to_account_info(),
            },
        )
        .with_signer(signer_seeds),
        pending,
        ctx.accounts.mint.decimals,
    )?;

    // Update reward debt
    let position = &mut ctx.accounts.position;
    position.reward_debt = (position.weighted_amount as u128)
        .checked_mul(config.accumulated_per_weight)
        .ok_or(HibernateError::MathOverflow)?
        / PRECISION;

    msg!("Claimed {} Elixir rewards", pending);
    Ok(())
}
```

**IMPORTANT NOTE on claim:** Reward vault transfers to user do NOT need TransferHook CPI because the reward vault is program-owned. However, Token-2022 `transfer_checked` via anchor-spl WILL invoke the hook. If the hook rejects vault-to-user transfers (e.g., daily limit), we may need to pause the hook or use the raw invoke approach. Test this in Task 7. If it fails, switch to the `invoke_transfer_checked_with_hook` approach with `remaining_accounts`.

**Step 3: Add unstake instruction**

```rust
pub fn unstake<'info>(
    ctx: Context<'_, '_, 'info, 'info, Unstake<'info>>,
) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;

    // Check lock expired
    require!(
        now >= ctx.accounts.position.lock_end,
        HibernateError::LockNotExpired
    );

    let config = &mut ctx.accounts.config;
    update_accumulated(config, now);

    let position = &ctx.accounts.position;
    let pending = calculate_pending(position, config)?;
    let stake_amount = position.amount;
    let weighted = position.weighted_amount;

    // Claim any remaining rewards
    if pending > 0 {
        let mint_key = config.mint;
        let reward_bump = config.reward_vault_bump;
        let bump_bytes = [reward_bump];
        let signer_seeds: &[&[&[u8]]] = &[&[REWARD_VAULT_SEED, mint_key.as_ref(), &bump_bytes]];

        anchor_spl::token_2022::transfer_checked(
            CpiContext::new(
                ctx.accounts.token_2022_program.to_account_info(),
                anchor_spl::token_2022::TransferChecked {
                    from: ctx.accounts.reward_vault.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.user_hoge.to_account_info(),
                    authority: ctx.accounts.reward_vault.to_account_info(),
                },
            )
            .with_signer(signer_seeds),
            pending,
            ctx.accounts.mint.decimals,
        )?;
    }

    // Return staked $HOGE from vault to user
    let mint_key = config.mint;
    let vault_bump = config.vault_bump;
    let bump_bytes = [vault_bump];
    let vault_seeds: &[&[&[u8]]] = &[&[VAULT_SEED, mint_key.as_ref(), &bump_bytes]];
    let remaining = ctx.remaining_accounts.to_vec();
    let decimals = ctx.accounts.mint.decimals;

    invoke_transfer_checked_with_hook(
        &ctx.accounts.token_2022_program.to_account_info(),
        &ctx.accounts.vault.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.user_hoge.to_account_info(),
        &ctx.accounts.vault.to_account_info(),
        &remaining,
        stake_amount,
        decimals,
        vault_seeds,
    )?;

    // Update global totals
    config.total_staked = config.total_staked.saturating_sub(stake_amount);
    config.total_weighted = config.total_weighted.saturating_sub(weighted);

    msg!("Exited hibernation: {} $HOGE returned + {} rewards", stake_amount, pending);
    Ok(())
}
```

**Step 4: Add fund_rewards instruction**

```rust
pub fn fund_rewards<'info>(
    ctx: Context<'_, '_, 'info, 'info, FundRewards<'info>>,
    amount: u64,
) -> Result<()> {
    require!(amount > 0, HibernateError::InvalidAmount);

    let now = Clock::get()?.unix_timestamp;
    let config = &mut ctx.accounts.config;
    update_accumulated(config, now);

    // Transfer fees from admin to reward vault (with hook)
    let remaining = ctx.remaining_accounts.to_vec();
    let decimals = ctx.accounts.mint.decimals;

    invoke_transfer_checked_with_hook(
        &ctx.accounts.token_2022_program.to_account_info(),
        &ctx.accounts.admin_hoge.to_account_info(),
        &ctx.accounts.mint.to_account_info(),
        &ctx.accounts.reward_vault.to_account_info(),
        &ctx.accounts.admin.to_account_info(),
        &remaining,
        amount,
        decimals,
        &[], // admin signs directly
    )?;

    msg!("Funded reward vault with {} tokens", amount);
    Ok(())
}
```

**Step 5: Add update_reward_rate instruction**

```rust
pub fn update_reward_rate(ctx: Context<UpdateRewardRate>, new_rate: u64) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let config = &mut ctx.accounts.config;
    update_accumulated(config, now);
    config.reward_rate = new_rate;
    msg!("Reward rate updated to {} per second", new_rate);
    Ok(())
}
```

**Step 6: Add all remaining account contexts**

```rust
#[derive(Accounts)]
pub struct Claim<'info> {
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED], bump = config.bump,
    )]
    pub config: Account<'info, HibernateConfig>,

    #[account(
        mut,
        seeds = [STAKE_SEED, user.key().as_ref()], bump = position.bump,
        constraint = position.owner == user.key() @ HibernateError::Unauthorized,
    )]
    pub position: Account<'info, StakePosition>,

    #[account(constraint = mint.key() == config.mint)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [REWARD_VAULT_SEED, mint.key().as_ref()], bump = config.reward_vault_bump,
    )]
    pub reward_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(mut, token::mint = mint)]
    pub user_hoge: InterfaceAccount<'info, TokenAccount>,

    pub token_2022_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED], bump = config.bump,
    )]
    pub config: Account<'info, HibernateConfig>,

    #[account(
        mut,
        seeds = [STAKE_SEED, user.key().as_ref()], bump = position.bump,
        constraint = position.owner == user.key() @ HibernateError::Unauthorized,
        close = user,
    )]
    pub position: Account<'info, StakePosition>,

    #[account(constraint = mint.key() == config.mint)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [VAULT_SEED, mint.key().as_ref()], bump = config.vault_bump,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [REWARD_VAULT_SEED, mint.key().as_ref()], bump = config.reward_vault_bump,
    )]
    pub reward_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(mut, token::mint = mint)]
    pub user_hoge: InterfaceAccount<'info, TokenAccount>,

    pub token_2022_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
pub struct FundRewards<'info> {
    #[account(
        mut,
        constraint = admin.key() == config.admin @ HibernateError::Unauthorized,
    )]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED], bump = config.bump,
    )]
    pub config: Account<'info, HibernateConfig>,

    #[account(constraint = mint.key() == config.mint)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [REWARD_VAULT_SEED, mint.key().as_ref()], bump = config.reward_vault_bump,
    )]
    pub reward_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(mut, token::mint = mint, token::authority = admin)]
    pub admin_hoge: InterfaceAccount<'info, TokenAccount>,

    pub token_2022_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
pub struct UpdateRewardRate<'info> {
    #[account(constraint = admin.key() == config.admin @ HibernateError::Unauthorized)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED], bump = config.bump,
    )]
    pub config: Account<'info, HibernateConfig>,
}
```

**Step 7: Build**

```bash
cd solana && anchor build -p groundhoge-hibernate
```

**Step 8: Commit**

```bash
git add programs/groundhoge-hibernate/src/lib.rs
git commit -m "feat(hibernate): add claim, unstake, fund_rewards, update_reward_rate"
```

---

### Task 6: Deploy to Devnet

**Files:**
- No file changes — deployment only

**Step 1: Deploy**

```bash
export PATH="$HOME/.avm/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"
cd solana && anchor deploy -p groundhoge-hibernate --provider.cluster devnet
```

If insufficient SOL, airdrop first:
```bash
solana airdrop 2 --keypair ~/.config/solana/groundhoge-dev.json --url devnet
```

Expected: Program deployed, shows program ID matching `declare_id!`.

**Step 2: Copy IDL for client**

```bash
cp target/idl/groundhoge_hibernate.json ../public/idl/
```

**Step 3: Commit IDL**

```bash
cd .. && git add public/idl/groundhoge_hibernate.json
git commit -m "chore(hibernate): deploy to devnet, add client IDL"
```

---

### Task 7: Init + Fund Scripts

**Files:**
- Create: `solana/scripts/init-hibernate.ts`
- Create: `solana/scripts/fund-hibernate.ts`

**Step 1: Write init-hibernate.ts**

Follow the pattern from `init-burrow.ts`. The script should:
1. Load admin keypair and devnet connection
2. Load the hibernate IDL from `../target/idl/groundhoge_hibernate.json`
3. Call `initialize(reward_rate)` with a sensible devnet rate (e.g., 100 raw units/sec = 1.00 $HOGE/sec for testing)
4. Derive all PDAs: config (`hibernate-config`), vault (`hibernate-vault` + mint), reward_vault (`hibernate-rewards` + mint)
5. Print all created accounts
6. Save hibernate info to `solana/hibernate-info.json`

Key accounts for the initialize call:
```typescript
{
  admin: admin.publicKey,
  config: configPDA,
  mint: HOGE_MINT,
  vault: vaultPDA,
  rewardVault: rewardVaultPDA,
  token2022Program: TOKEN_2022_PROGRAM_ID,
  systemProgram: SystemProgram.programId,
}
```

**Step 2: Write fund-hibernate.ts**

This script:
1. Loads admin keypair and hibernate IDL
2. Calls `fund_rewards(amount)` with a test amount (e.g., 10,000 $HOGE = 1,000,000 raw)
3. Needs to pass TransferHook extra accounts as `remaining_accounts` (same pattern as `test-swap.ts` — use `addExtraAccountMetasForExecute` from `@solana/spl-token`)
4. Prints reward vault balance after funding

**Step 3: Run init script**

```bash
cd solana && npx tsx scripts/init-hibernate.ts
```

**Step 4: Run fund script**

```bash
npx tsx scripts/fund-hibernate.ts
```

**Step 5: Commit**

```bash
git add scripts/init-hibernate.ts scripts/fund-hibernate.ts hibernate-info.json
git commit -m "feat(hibernate): init + fund scripts, deployed to devnet"
```

---

### Task 8: Client Library (lib/hibernate.ts)

**Files:**
- Create: `lib/hibernate.ts`
- Modify: `lib/solana.ts` (add hibernate constants)

**Step 1: Add hibernate constants to lib/solana.ts**

After the pool constants, add:
```typescript
// Hibernate program
export const HIBERNATE_PROGRAM_ID = new PublicKey("ACTUAL_PROGRAM_ID");

// Hibernate PDAs (derived after deploy)
export const HIBERNATE_CONFIG_PDA = new PublicKey("FROM_HIBERNATE_INFO");
export const HIBERNATE_VAULT = new PublicKey("FROM_HIBERNATE_INFO");
export const HIBERNATE_REWARD_VAULT = new PublicKey("FROM_HIBERNATE_INFO");
```

Fill actual values from `hibernate-info.json` after Task 7.

**Step 2: Write lib/hibernate.ts**

Follow the pattern from `lib/swap.ts`. Export:

```typescript
export type HibernateTier = "LightSleep" | "DeepSleep" | "TrueHibernation" | "Permafrost";

export const TIER_INFO: Record<HibernateTier, { label: string; days: number; multiplier: number }> = {
  LightSleep: { label: "Light Sleep", days: 7, multiplier: 1 },
  DeepSleep: { label: "Deep Sleep", days: 30, multiplier: 2 },
  TrueHibernation: { label: "True Hibernation", days: 90, multiplier: 5 },
  Permafrost: { label: "Permafrost", days: 365, multiplier: 10 },
};

export async function buildStakeTransaction(...)  // builds tx for stake instruction
export async function buildClaimTransaction(...)  // builds tx for claim instruction
export async function buildUnstakeTransaction(...) // builds tx for unstake instruction
export async function fetchStakePosition(...)     // reads StakePosition PDA
export async function fetchHibernateConfig(...)   // reads HibernateConfig PDA
export function calculatePendingRewards(...)      // client-side reward estimation
```

For `buildStakeTransaction`: use `addExtraAccountMetasForExecute` from `@solana/spl-token` to resolve hook extra accounts, same as `lib/swap.ts` does for swap transactions. Pass them as remaining accounts in the Anchor method call.

**Step 3: Commit**

```bash
git add lib/hibernate.ts lib/solana.ts
git commit -m "feat(hibernate): client library for stake/claim/unstake"
```

---

### Task 9: Hibernation Portal UI

**Files:**
- Create: `components/HibernatePanel.tsx`
- Create: `app/hibernate/page.tsx`

**Step 1: Write HibernatePanel.tsx**

Follow `SwapPanel.tsx` patterns for wallet integration, transaction signing, and styling. Component should render:

1. **Header:** "HIBERNATION PORTAL" with groundhog sleeping icon
2. **Current Position** (if staked): tier badge, amount, time remaining countdown, accrued Elixir rewards, Claim button, Unstake button (only if unlocked)
3. **Tier Selector** (if no position): 4 cards in a row — Light Sleep / Deep Sleep / True Hibernation / Permafrost. Each shows lock period, multiplier, shadow protection. Selected state highlighted.
4. **Amount Input** (if no position): amount field with MAX button
5. **Stake Button** (if no position): "Enter Hibernation" — executes stake transaction
6. **Stats footer:** Total staked, total stakers, reward rate, vault balance

Use the existing CSS variables (--bg, --green, --amber, --muted, --card-border, --blue). Tier colors:
- Light Sleep: blue (#4488ff)
- Deep Sleep: green (#00ff88)  
- True Hibernation: amber (#ffaa00)
- Permafrost: ice cyan (#00ddff)

**Step 2: Write app/hibernate/page.tsx**

```tsx
import HibernatePanel from "@/components/HibernatePanel";

export default function HibernatePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <HibernatePanel />
    </div>
  );
}
```

**Step 3: Add link to Hibernation Portal from main page**

In `components/Community.tsx`, update the "Hibernation Portal — COMING Q3 2026" link to point to `/hibernate`.

**Step 4: Build and verify**

```bash
npx next build
```

**Step 5: Commit**

```bash
git add components/HibernatePanel.tsx app/hibernate/page.tsx components/Community.tsx
git commit -m "feat(hibernate): hibernation portal UI at /hibernate"
```

---

### Task 10: End-to-End Devnet Test

**Files:**
- Create: `solana/scripts/test-hibernate.ts`

**Step 1: Write test-hibernate.ts**

Script that runs through the full flow on devnet:
1. Initialize config (skip if already done)
2. Fund reward vault with test $HOGE
3. Stake 100 $HOGE as LightSleep tier
4. Wait 5 seconds
5. Claim rewards — verify > 0
6. Check position still locked (lock_end in future)
7. Print all state: config, position, vault balances, pending rewards

**Step 2: Run test**

```bash
cd solana && npx tsx scripts/test-hibernate.ts
```

Expected: All steps succeed, rewards accrue, position tracked correctly.

**Step 3: Test in browser**

1. `npx next dev --port 3099`
2. Go to `http://localhost:3099/hibernate`
3. Connect wallet (Phantom with devnet)
4. Select tier, enter amount, stake
5. Verify position shows, rewards accrue
6. Claim rewards
7. Wait for lock expiry (use LightSleep 7d — or temporarily set to 60s for testing)

**Step 4: Commit**

```bash
git add scripts/test-hibernate.ts
git commit -m "test(hibernate): end-to-end devnet test script"
```

---

### Task 11: Final Build + Deploy

**Step 1: Full build verification**

```bash
npx next build
```

**Step 2: Deploy to Vercel**

```bash
vercel pull --yes && vercel build --prod && vercel deploy --prebuilt --prod --archive=tgz
```

**Step 3: Final commit with all changes**

```bash
git add -A
git commit -m "feat: hibernation staking portal — complete"
```
