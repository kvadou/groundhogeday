use anchor_lang::prelude::*;
use anchor_spl::{
    token::Token,
    token_2022::Token2022,
    token_interface::{self, Mint, TokenAccount, TransferChecked},
};
use anchor_lang::solana_program::program::invoke_signed;

declare_id!("4TJmU197oWhxmjSq5LR8fSvcgy3i6drXhP5zhNzKi9zi");

/// The Burrow — Groundhoge Day's native AMM
///
/// x·y=k swap pool for $HOGE/WSOL. Natively supports Token-2022 with TransferHook.

const POOL_SEED: &[u8] = b"burrow-pool";
const AUTHORITY_SEED: &[u8] = b"burrow-auth";
const LP_FEE_BPS: u64 = 30; // 0.3%

#[program]
pub mod groundhoge_burrow {
    use super::*;

    /// Step 1: Create the pool state. Vaults are created client-side beforehand.
    pub fn create_pool(ctx: Context<CreatePool>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.admin = ctx.accounts.admin.key();
        pool.hoge_mint = ctx.accounts.hoge_mint.key();
        pool.wsol_mint = ctx.accounts.wsol_mint.key();
        pool.vault_hoge = ctx.accounts.vault_hoge.key();
        pool.vault_wsol = ctx.accounts.vault_wsol.key();
        pool.hoge_reserve = 0;
        pool.sol_reserve = 0;
        pool.total_volume = 0;
        pool.total_swaps = 0;
        pool.bump = ctx.bumps.pool;
        pool.authority_bump = ctx.bumps.pool_authority;
        pool.paused = false;

        msg!("The Burrow created. Awaiting liquidity.");
        Ok(())
    }

    /// Step 2: Sync reserves from actual vault balances.
    /// Admin transfers tokens directly to vaults, then calls this to update pool state.
    pub fn sync_reserves(ctx: Context<SyncReserves>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.hoge_reserve = ctx.accounts.vault_hoge.amount;
        pool.sol_reserve = ctx.accounts.vault_wsol.amount;
        msg!("Reserves synced: {} $HOGE, {} WSOL", pool.hoge_reserve, pool.sol_reserve);
        Ok(())
    }

    /// Swap SOL for $HOGE (buy).
    pub fn swap_sol_for_hoge<'info>(
        ctx: Context<'_, '_, 'info, 'info, SwapSolForHoge<'info>>,
        sol_in: u64,
        min_hoge_out: u64,
    ) -> Result<()> {
        require!(sol_in > 0, BurrowError::InvalidAmount);

        let pool = &mut ctx.accounts.pool;
        require!(!pool.paused, BurrowError::PoolPaused);
        require!(pool.sol_reserve > 0 && pool.hoge_reserve > 0, BurrowError::PoolNotInitialized);

        let hoge_out = calculate_output(sol_in, pool.sol_reserve, pool.hoge_reserve)?;
        require!(hoge_out >= min_hoge_out, BurrowError::SlippageExceeded);
        require!(hoge_out < pool.hoge_reserve, BurrowError::InsufficientLiquidity);

        // Extract values needed for CPI before mutable borrow ends
        let authority_bump = pool.authority_bump;
        let decimals = ctx.accounts.hoge_mint.decimals;
        let hoge_mint_key = ctx.accounts.hoge_mint.key();
        let remaining = ctx.remaining_accounts.to_vec();

        // Update state FIRST (optimistic — reverts if CPI fails)
        pool.sol_reserve = pool.sol_reserve.checked_add(sol_in).ok_or(BurrowError::MathOverflow)?;
        pool.hoge_reserve = pool.hoge_reserve.checked_sub(hoge_out).ok_or(BurrowError::MathOverflow)?;
        pool.total_volume = pool.total_volume.checked_add(sol_in).ok_or(BurrowError::MathOverflow)?;
        pool.total_swaps = pool.total_swaps.checked_add(1).ok_or(BurrowError::MathOverflow)?;

        emit!(SwapEvent {
            user: ctx.accounts.user.key(),
            direction: SwapDirection::Buy,
            amount_in: sol_in,
            amount_out: hoge_out,
            hoge_reserve: pool.hoge_reserve,
            sol_reserve: pool.sol_reserve,
        });

        // User sends WSOL to vault
        token_interface::transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.user_wsol.to_account_info(),
                    mint: ctx.accounts.wsol_mint.to_account_info(),
                    to: ctx.accounts.vault_wsol.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            sol_in,
            9,
        )?;

        // Vault sends $HOGE to user (raw invoke for TransferHook support in CPI)
        let bump = [authority_bump];
        let signer_seeds: &[&[&[u8]]] = &[&[AUTHORITY_SEED, hoge_mint_key.as_ref(), &bump]];

        invoke_transfer_checked_with_hook(
            &ctx.accounts.token_2022_program.to_account_info(),
            &ctx.accounts.vault_hoge.to_account_info(),
            &ctx.accounts.hoge_mint.to_account_info(),
            &ctx.accounts.user_hoge.to_account_info(),
            &ctx.accounts.pool_authority.to_account_info(),
            &remaining,
            hoge_out,
            decimals,
            signer_seeds,
        )?;

        Ok(())
    }

    /// Swap $HOGE for SOL (sell).
    pub fn swap_hoge_for_sol<'info>(
        ctx: Context<'_, '_, 'info, 'info, SwapHogeForSol<'info>>,
        hoge_in: u64,
        min_sol_out: u64,
    ) -> Result<()> {
        require!(hoge_in > 0, BurrowError::InvalidAmount);

        let pool = &mut ctx.accounts.pool;
        require!(!pool.paused, BurrowError::PoolPaused);
        require!(pool.sol_reserve > 0 && pool.hoge_reserve > 0, BurrowError::PoolNotInitialized);

        let sol_out = calculate_output(hoge_in, pool.hoge_reserve, pool.sol_reserve)?;
        require!(sol_out >= min_sol_out, BurrowError::SlippageExceeded);
        require!(sol_out < pool.sol_reserve, BurrowError::InsufficientLiquidity);

        // Extract values needed for CPI before mutable borrow ends
        let authority_bump = pool.authority_bump;
        let decimals = ctx.accounts.hoge_mint.decimals;
        let hoge_mint_key = ctx.accounts.hoge_mint.key();
        let remaining = ctx.remaining_accounts.to_vec();

        // Update state FIRST (optimistic — reverts if CPI fails)
        pool.hoge_reserve = pool.hoge_reserve.checked_add(hoge_in).ok_or(BurrowError::MathOverflow)?;
        pool.sol_reserve = pool.sol_reserve.checked_sub(sol_out).ok_or(BurrowError::MathOverflow)?;
        pool.total_volume = pool.total_volume.checked_add(sol_out).ok_or(BurrowError::MathOverflow)?;
        pool.total_swaps = pool.total_swaps.checked_add(1).ok_or(BurrowError::MathOverflow)?;

        emit!(SwapEvent {
            user: ctx.accounts.user.key(),
            direction: SwapDirection::Sell,
            amount_in: hoge_in,
            amount_out: sol_out,
            hoge_reserve: pool.hoge_reserve,
            sol_reserve: pool.sol_reserve,
        });

        // User sends $HOGE to vault (raw invoke for TransferHook support in CPI)
        invoke_transfer_checked_with_hook(
            &ctx.accounts.token_2022_program.to_account_info(),
            &ctx.accounts.user_hoge.to_account_info(),
            &ctx.accounts.hoge_mint.to_account_info(),
            &ctx.accounts.vault_hoge.to_account_info(),
            &ctx.accounts.user.to_account_info(),
            &remaining,
            hoge_in,
            decimals,
            &[], // user signs directly, no PDA seeds
        )?;

        // Vault sends WSOL to user
        let bump = [authority_bump];
        let signer_seeds: &[&[&[u8]]] = &[&[AUTHORITY_SEED, hoge_mint_key.as_ref(), &bump]];

        token_interface::transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.vault_wsol.to_account_info(),
                    mint: ctx.accounts.wsol_mint.to_account_info(),
                    to: ctx.accounts.user_wsol.to_account_info(),
                    authority: ctx.accounts.pool_authority.to_account_info(),
                },
            )
            .with_signer(signer_seeds),
            sol_out,
            9,
        )?;

        Ok(())
    }

    /// Admin: pause or unpause the pool.
    pub fn set_paused(ctx: Context<AdminAction>, paused: bool) -> Result<()> {
        ctx.accounts.pool.paused = paused;
        msg!("Pool paused: {}", paused);
        Ok(())
    }
}

// ── CPI Helper ────────────────────────────────────────────────────────

/// Build and invoke a Token-2022 TransferChecked instruction that includes
/// all extra accounts needed for the transfer hook. This bypasses Anchor's
/// CPI wrapper which doesn't support hook resolution in nested CPI.
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

    // TransferChecked instruction data: [12] + amount (u64 LE) + decimals (u8)
    let mut data = Vec::with_capacity(10);
    data.push(12u8); // TransferChecked instruction discriminator
    data.extend_from_slice(&amount.to_le_bytes());
    data.push(decimals);

    // Standard accounts for TransferChecked
    // Authority must always be marked as signer — invoke_signed provides the PDA signature
    let mut accounts = vec![
        AccountMeta::new(*source.key, false),
        AccountMeta::new_readonly(*mint.key, false),
        AccountMeta::new(*destination.key, false),
        AccountMeta::new_readonly(*authority.key, true),
    ];

    // Append extra accounts (hook program, extra metas PDA, daily counter, global counter, config)
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

    // Collect all account infos for the invoke
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

// ── Math ───────────────────────────────────────────────────────────────

fn calculate_output(amount_in: u64, reserve_in: u64, reserve_out: u64) -> Result<u64> {
    let fee_adjusted = (amount_in as u128)
        .checked_mul((10000 - LP_FEE_BPS) as u128)
        .ok_or(BurrowError::MathOverflow)?;
    let numerator = fee_adjusted
        .checked_mul(reserve_out as u128)
        .ok_or(BurrowError::MathOverflow)?;
    let denominator = (reserve_in as u128)
        .checked_mul(10000u128)
        .ok_or(BurrowError::MathOverflow)?
        .checked_add(fee_adjusted)
        .ok_or(BurrowError::MathOverflow)?;
    require!(denominator > 0, BurrowError::MathOverflow);
    Ok((numerator / denominator) as u64)
}

// ── Account Contexts ───────────────────────────────────────────────────

#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init, payer = admin, space = 8 + Pool::INIT_SPACE,
        seeds = [POOL_SEED, hoge_mint.key().as_ref()], bump,
    )]
    pub pool: Account<'info, Pool>,

    /// CHECK: PDA
    #[account(seeds = [AUTHORITY_SEED, hoge_mint.key().as_ref()], bump)]
    pub pool_authority: UncheckedAccount<'info>,

    /// CHECK: Just need pubkey
    pub hoge_mint: UncheckedAccount<'info>,
    /// CHECK: Just need pubkey
    pub wsol_mint: UncheckedAccount<'info>,

    /// CHECK: Pre-created vault for $HOGE
    pub vault_hoge: UncheckedAccount<'info>,
    /// CHECK: Pre-created vault for WSOL
    pub vault_wsol: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SyncReserves<'info> {
    #[account(constraint = admin.key() == pool.admin @ BurrowError::Unauthorized)]
    pub admin: Signer<'info>,

    #[account(mut, seeds = [POOL_SEED, pool.hoge_mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, Pool>,

    /// Vault $HOGE — read balance
    #[account(constraint = vault_hoge.key() == pool.vault_hoge)]
    pub vault_hoge: InterfaceAccount<'info, TokenAccount>,

    /// Vault WSOL — read balance
    #[account(constraint = vault_wsol.key() == pool.vault_wsol)]
    pub vault_wsol: InterfaceAccount<'info, TokenAccount>,
}

#[derive(Accounts)]
pub struct SwapSolForHoge<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, seeds = [POOL_SEED, hoge_mint.key().as_ref()], bump = pool.bump)]
    pub pool: Box<Account<'info, Pool>>,

    /// CHECK: PDA
    #[account(seeds = [AUTHORITY_SEED, hoge_mint.key().as_ref()], bump = pool.authority_bump)]
    pub pool_authority: UncheckedAccount<'info>,

    pub hoge_mint: Box<InterfaceAccount<'info, Mint>>,
    pub wsol_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut, token::mint = hoge_mint, token::authority = pool_authority,
              constraint = vault_hoge.key() == pool.vault_hoge @ BurrowError::InvalidVault)]
    pub vault_hoge: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, token::mint = wsol_mint, token::authority = pool_authority,
              constraint = vault_wsol.key() == pool.vault_wsol @ BurrowError::InvalidVault)]
    pub vault_wsol: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut, token::mint = wsol_mint, token::authority = user)]
    pub user_wsol: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, token::mint = hoge_mint)]
    pub user_hoge: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub token_2022_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
pub struct SwapHogeForSol<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, seeds = [POOL_SEED, hoge_mint.key().as_ref()], bump = pool.bump)]
    pub pool: Box<Account<'info, Pool>>,

    /// CHECK: PDA
    #[account(seeds = [AUTHORITY_SEED, hoge_mint.key().as_ref()], bump = pool.authority_bump)]
    pub pool_authority: UncheckedAccount<'info>,

    pub hoge_mint: Box<InterfaceAccount<'info, Mint>>,
    pub wsol_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut, token::mint = hoge_mint, token::authority = pool_authority,
              constraint = vault_hoge.key() == pool.vault_hoge @ BurrowError::InvalidVault)]
    pub vault_hoge: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, token::mint = wsol_mint, token::authority = pool_authority,
              constraint = vault_wsol.key() == pool.vault_wsol @ BurrowError::InvalidVault)]
    pub vault_wsol: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut, token::mint = hoge_mint, token::authority = user)]
    pub user_hoge: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, token::mint = wsol_mint)]
    pub user_wsol: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
    pub token_2022_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(constraint = admin.key() == pool.admin @ BurrowError::Unauthorized)]
    pub admin: Signer<'info>,

    #[account(mut, seeds = [POOL_SEED, pool.hoge_mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, Pool>,
}

// ── State ──────────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct Pool {
    pub admin: Pubkey,
    pub hoge_mint: Pubkey,
    pub wsol_mint: Pubkey,
    pub vault_hoge: Pubkey,
    pub vault_wsol: Pubkey,
    pub hoge_reserve: u64,
    pub sol_reserve: u64,
    pub total_volume: u64,
    pub total_swaps: u64,
    pub bump: u8,
    pub authority_bump: u8,
    pub paused: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub enum SwapDirection { Buy, Sell }

#[event]
pub struct SwapEvent {
    pub user: Pubkey,
    pub direction: SwapDirection,
    pub amount_in: u64,
    pub amount_out: u64,
    pub hoge_reserve: u64,
    pub sol_reserve: u64,
}

#[error_code]
pub enum BurrowError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
    #[msg("Slippage exceeded")]
    SlippageExceeded,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid vault account")]
    InvalidVault,
    #[msg("Pool not initialized — both reserves must be non-zero")]
    PoolNotInitialized,
    #[msg("Pool is paused")]
    PoolPaused,
}
