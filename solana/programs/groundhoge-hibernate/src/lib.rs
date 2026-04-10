use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::Token2022,
    token_interface::{Mint, TokenAccount},
};
use anchor_lang::solana_program::program::invoke_signed;

declare_id!("8udHGYeRaqNHAMeK3Br66q4mciViz8dL3D4rtPpUXD6q");

// ── Seeds ─────────────────────────────────────────────────────────────
const CONFIG_SEED: &[u8] = b"hibernate-config";
const VAULT_SEED: &[u8] = b"hibernate-vault";
const REWARD_VAULT_SEED: &[u8] = b"hibernate-rewards";
const STAKE_SEED: &[u8] = b"stake";

/// Precision multiplier for accumulated_per_weight math (u128)
const PRECISION: u128 = 1_000_000_000_000;

// ── Tier Definitions ──────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum HibernateTier {
    LightSleep,
    DeepSleep,
    TrueHibernation,
    Permafrost,
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

// ── Helpers ───────────────────────────────────────────────────────────

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

fn calculate_pending(position: &StakePosition, config: &HibernateConfig) -> Result<u64> {
    let gross = (position.weighted_amount as u128)
        .checked_mul(config.accumulated_per_weight)
        .ok_or(HibernateError::MathOverflow)?
        / PRECISION;
    let pending = gross.saturating_sub(position.reward_debt);
    Ok(pending as u64)
}

/// Raw invoke for Token-2022 TransferChecked with TransferHook support.
/// Anchor's CPI wrapper doesn't handle hook resolution in nested CPI.
/// Copied from groundhoge-burrow which solved this same problem.
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
    data.push(12u8); // TransferChecked instruction discriminator
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

// ── Program ───────────────────────────────────────────────────────────

#[program]
pub mod groundhoge_hibernate {
    use super::*;

    /// Initialize the Hibernation Portal — creates config + vault PDAs
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

    /// Stake $HOGE into a hibernation tier
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

    /// Claim accrued Elixir rewards
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

    /// Unstake — returns $HOGE + claims remaining rewards (only after lock expires)
    pub fn unstake<'info>(
        ctx: Context<'_, '_, 'info, 'info, Unstake<'info>>,
    ) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;

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

        // Return staked $HOGE from vault to user (with TransferHook)
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

    /// Admin: fund reward vault with harvested transfer fees
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

    /// Admin: update reward emission rate
    pub fn update_reward_rate(ctx: Context<UpdateRewardRate>, new_rate: u64) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        let config = &mut ctx.accounts.config;
        update_accumulated(config, now);
        config.reward_rate = new_rate;
        msg!("Reward rate updated to {} per second", new_rate);
        Ok(())
    }
}

// ── Account Contexts ──────────────────────────────────────────────────

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

    #[account(
        init, payer = admin,
        seeds = [VAULT_SEED, mint.key().as_ref()], bump,
        token::mint = mint,
        token::authority = vault,
        token::token_program = token_2022_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

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
    pub reward_rate: u64,
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
