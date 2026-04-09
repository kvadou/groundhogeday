use anchor_lang::prelude::*;
use anchor_lang::system_program;
use spl_tlv_account_resolution::{
    account::ExtraAccountMeta, seeds::Seed, state::ExtraAccountMetaList,
};
use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};

declare_id!("BfeZebQtPz4aXyScC4aLyoSCTW6RfSC5iFMpvZ4zkHDU");

/// Groundhoge Day Transfer Hook
///
/// Enforces two rules on every $HOGE transfer:
/// 1. Daily sell limit: max 1,883 tokens per wallet per 24h cycle (resets 7:25 AM EST)
/// 2. 109th transaction trap: every 109th global transfer is flagged for 99% seizure
///    via PermanentDelegate (hooks can only reject, not modify amounts)

// ── Constants ──────────────────────────────────────────────────────────
/// 1,883 tokens with 2 decimals = 188,300 raw units
const DAILY_SELL_LIMIT_RAW: u64 = 188_300;

/// Every Nth transaction triggers the trap
const TRAP_INTERVAL: u64 = 109;

/// 24 hours in seconds
const RESET_INTERVAL_SECS: i64 = 86_400;

/// 7:25 AM EST = 12:25 UTC = 44,700 seconds from midnight UTC
const RESET_TIME_UTC_SECS: i64 = 44_700;

// ── Seeds ──────────────────────────────────────────────────────────────
const EXTRA_METAS_SEED: &[u8] = b"extra-account-metas";
const DAILY_COUNTER_SEED: &[u8] = b"daily-limit";
const GLOBAL_COUNTER_SEED: &[u8] = b"tx-counter";
const CONFIG_SEED: &[u8] = b"hook-config";

#[program]
pub mod groundhoge_hook {
    use super::*;

    /// One-time setup: create the ExtraAccountMetaList PDA and initialize
    /// global state (tx counter + config).
    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        let extra_metas = get_extra_account_metas();

        let account_size = ExtraAccountMetaList::size_of(extra_metas.len())
            .map_err(|_| ErrorCode::AccountDidNotSerialize)?;

        let lamports = Rent::get()?.minimum_balance(account_size);
        let mint_key = ctx.accounts.mint.key();
        let signer_seeds: &[&[u8]] = &[
            EXTRA_METAS_SEED,
            mint_key.as_ref(),
            &[ctx.bumps.extra_account_meta_list],
        ];

        system_program::create_account(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::CreateAccount {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.extra_account_meta_list.to_account_info(),
                },
            )
            .with_signer(&[signer_seeds]),
            lamports,
            account_size as u64,
            ctx.program_id,
        )?;

        ExtraAccountMetaList::init::<ExecuteInstruction>(
            &mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
            &extra_metas,
        )
        .map_err(|_| ErrorCode::AccountDidNotSerialize)?;

        // Init global tx counter
        let counter = &mut ctx.accounts.global_counter;
        counter.count = 0;
        counter.last_trapped_count = 0;

        // Init config
        let config = &mut ctx.accounts.config;
        config.admin = ctx.accounts.payer.key();
        config.paused = false;

        msg!("Groundhoge Hook initialized. The Oracle sees all trades.");
        Ok(())
    }

    /// Register a wallet so it can trade. Creates the per-wallet daily counter PDA.
    /// Anyone can call this (for their own wallet or on behalf of another).
    pub fn register_wallet(ctx: Context<RegisterWallet>) -> Result<()> {
        let counter = &mut ctx.accounts.daily_counter;
        counter.day_epoch = 0;
        counter.amount_transferred = 0;
        msg!(
            "Wallet {} registered with The Oracle.",
            ctx.accounts.wallet.key()
        );
        Ok(())
    }

    /// Transfer hook — called by Token-2022 on every transfer.
    ///
    /// Standard accounts (indices 0-4, passed by Token-2022):
    ///   0: source token account
    ///   1: mint
    ///   2: destination token account
    ///   3: source owner/delegate
    ///   4: extra_account_meta_list PDA
    ///
    /// Extra accounts (indices 5+, defined by us):
    ///   5: daily_counter (per-wallet, writable — may be uninitialized)
    ///   6: global_counter (writable)
    ///   7: config (read-only)
    pub fn execute_hook(ctx: Context<ExecuteHook>, amount: u64) -> Result<()> {
        let config = &ctx.accounts.config;

        // Paused = allow all (admin escape hatch)
        if config.paused {
            return Ok(());
        }

        // ── Daily Sell Limit ───────────────────────────────────────────
        // If the wallet has a registered daily_counter PDA, enforce limits.
        // Unregistered wallets (no PDA data) bypass the daily limit but
        // transfers still work — the website auto-registers on connect.
        let daily_ai = ctx.accounts.daily_counter.to_account_info();
        if daily_ai.data_len() >= 8 + DailyCounter::INIT_SPACE {
            let clock = Clock::get()?;
            let current_epoch = compute_day_epoch(clock.unix_timestamp);
            let mut data = daily_ai.try_borrow_mut_data()?;

            // Read current values (skip 8-byte Anchor discriminator)
            let mut day_epoch =
                u64::from_le_bytes(data[8..16].try_into().unwrap());
            let mut amount_transferred =
                u64::from_le_bytes(data[16..24].try_into().unwrap());

            // Reset if new day epoch
            if day_epoch != current_epoch {
                day_epoch = current_epoch;
                amount_transferred = 0;
            }

            let new_total = amount_transferred
                .checked_add(amount)
                .ok_or(HogeError::Overflow)?;

            require!(
                new_total <= DAILY_SELL_LIMIT_RAW,
                HogeError::DailySellLimitExceeded
            );

            // Write back
            data[8..16].copy_from_slice(&day_epoch.to_le_bytes());
            data[16..24].copy_from_slice(&new_total.to_le_bytes());

            msg!(
                "Transfer OK: {} raw units. Daily: {}/{}",
                amount,
                new_total,
                DAILY_SELL_LIMIT_RAW
            );
        } else {
            msg!(
                "Wallet unregistered — daily limit bypassed. Transfer: {} raw units",
                amount
            );
        }

        // ── 109th Transaction Trap ─────────────────────────────────────
        let global = &mut ctx.accounts.global_counter;
        global.count = global.count.checked_add(1).ok_or(HogeError::Overflow)?;

        if global.count % TRAP_INTERVAL == 0 {
            global.last_trapped_count = global.count;
            emit!(TrapTriggered {
                tx_number: global.count,
                source: ctx.accounts.source_token.key(),
                destination: ctx.accounts.destination_token.key(),
                amount,
            });
            msg!(
                "THE ORACLE SPEAKS! Tx #{} trapped by the 109th prophecy!",
                global.count
            );
        }

        Ok(())
    }

    /// Admin: pause/unpause the hook
    pub fn set_paused(ctx: Context<AdminAction>, paused: bool) -> Result<()> {
        ctx.accounts.config.paused = paused;
        msg!("Hook paused: {}", paused);
        Ok(())
    }

    /// Fallback: routes SPL Transfer Hook Interface calls to execute_hook.
    /// Token-2022 uses the SPL discriminator, not Anchor's.
    pub fn fallback<'info>(
        program_id: &Pubkey,
        accounts: &'info [AccountInfo<'info>],
        data: &[u8],
    ) -> Result<()> {
        let instruction = TransferHookInstruction::unpack(data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        match instruction {
            TransferHookInstruction::Execute { amount } => {
                let amount_bytes = amount.to_le_bytes();
                __private::__global::execute_hook(program_id, accounts, &amount_bytes)
            }
            _ => Err(ProgramError::InvalidInstructionData.into()),
        }
    }
}

// ── Helpers ────────────────────────────────────────────────────────────

/// Day epoch that resets at 7:25 AM EST (12:25 UTC)
fn compute_day_epoch(unix_timestamp: i64) -> u64 {
    let shifted = unix_timestamp - RESET_TIME_UTC_SECS;
    (shifted / RESET_INTERVAL_SECS) as u64
}

/// Extra accounts the hook needs. Token-2022 resolves these dynamically.
fn get_extra_account_metas() -> Vec<ExtraAccountMeta> {
    vec![
        // [5] Daily counter PDA: ["daily-limit", source_owner_pubkey]
        // Account index 3 = source owner/delegate in Execute layout
        ExtraAccountMeta::new_with_seeds(
            &[
                Seed::Literal {
                    bytes: DAILY_COUNTER_SEED.to_vec(),
                },
                Seed::AccountKey { index: 3 },
            ],
            false, // not a signer
            true,  // writable
        )
        .unwrap(),
        // [6] Global counter PDA: ["tx-counter"]
        ExtraAccountMeta::new_with_seeds(
            &[Seed::Literal {
                bytes: GLOBAL_COUNTER_SEED.to_vec(),
            }],
            false,
            true,
        )
        .unwrap(),
        // [7] Config PDA: ["hook-config"]
        ExtraAccountMeta::new_with_seeds(
            &[Seed::Literal {
                bytes: CONFIG_SEED.to_vec(),
            }],
            false,
            false, // read-only
        )
        .unwrap(),
    ]
}

// ── Account Contexts ───────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Just need the pubkey for PDA derivation
    pub mint: UncheckedAccount<'info>,

    /// CHECK: Manually initialized via ExtraAccountMetaList::init
    #[account(
        mut,
        seeds = [EXTRA_METAS_SEED, mint.key().as_ref()],
        bump,
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + GlobalCounter::INIT_SPACE,
        seeds = [GLOBAL_COUNTER_SEED],
        bump,
    )]
    pub global_counter: Account<'info, GlobalCounter>,

    #[account(
        init,
        payer = payer,
        space = 8 + HookConfig::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump,
    )]
    pub config: Account<'info, HookConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterWallet<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The wallet to register
    /// CHECK: Any valid pubkey
    pub wallet: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + DailyCounter::INIT_SPACE,
        seeds = [DAILY_COUNTER_SEED, wallet.key().as_ref()],
        bump,
    )]
    pub daily_counter: Account<'info, DailyCounter>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteHook<'info> {
    /// CHECK: Source token account — validated by Token-2022
    pub source_token: UncheckedAccount<'info>,

    /// CHECK: Mint — validated by Token-2022
    pub mint: UncheckedAccount<'info>,

    /// CHECK: Destination token account — validated by Token-2022
    pub destination_token: UncheckedAccount<'info>,

    /// CHECK: Source owner/delegate — validated by Token-2022
    pub source_authority: UncheckedAccount<'info>,

    /// CHECK: ExtraAccountMetaList — validated by Token-2022
    #[account(
        seeds = [EXTRA_METAS_SEED, mint.key().as_ref()],
        bump,
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,

    // ── Extra accounts (must match get_extra_account_metas order) ──

    /// CHECK: Per-wallet daily counter PDA. May be uninitialized for
    /// unregistered wallets — daily limit is skipped in that case.
    /// Seeds validated via constraint below.
    #[account(
        mut,
        seeds = [DAILY_COUNTER_SEED, source_authority.key().as_ref()],
        bump,
    )]
    pub daily_counter: UncheckedAccount<'info>,

    /// Global tx counter
    #[account(
        mut,
        seeds = [GLOBAL_COUNTER_SEED],
        bump,
    )]
    pub global_counter: Account<'info, GlobalCounter>,

    /// Config (read-only)
    #[account(
        seeds = [CONFIG_SEED],
        bump,
    )]
    pub config: Account<'info, HookConfig>,
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(
        constraint = admin.key() == config.admin @ HogeError::Unauthorized
    )]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump,
    )]
    pub config: Account<'info, HookConfig>,
}

// ── State ──────────────────────────────────────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct DailyCounter {
    pub day_epoch: u64,
    pub amount_transferred: u64,
}

#[account]
#[derive(InitSpace)]
pub struct GlobalCounter {
    pub count: u64,
    pub last_trapped_count: u64,
}

#[account]
#[derive(InitSpace)]
pub struct HookConfig {
    pub admin: Pubkey,
    pub paused: bool,
}

// ── Events ─────────────────────────────────────────────────────────────

#[event]
pub struct TrapTriggered {
    pub tx_number: u64,
    pub source: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
}

// ── Errors ─────────────────────────────────────────────────────────────

#[error_code]
pub enum HogeError {
    #[msg("Daily sell limit of 1,883 $HOGE exceeded. The Oracle restricts your trades.")]
    DailySellLimitExceeded,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Unauthorized")]
    Unauthorized,
}
