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
const EXEMPT_LIST_SEED: &[u8] = b"exempt-list";

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

        // ── Exempt Address Check ──────────────────────────────────────
        // If source or destination token account is in the exempt list,
        // skip daily limit entirely (allows DEX pool vault trading)
        let source_key = ctx.accounts.source_token.key();
        let dest_key = ctx.accounts.destination_token.key();
        let exempt = &ctx.accounts.exempt_list;

        let is_exempt = exempt.addresses.iter().any(|addr| {
            *addr == source_key || *addr == dest_key
        });

        if is_exempt {
            // Still count global tx but skip daily limit
            let global = &mut ctx.accounts.global_counter;
            global.count = global.count.checked_add(1).ok_or(HogeError::Overflow)?;

            if global.count % TRAP_INTERVAL == 0 {
                global.last_trapped_count = global.count;
                emit!(TrapTriggered {
                    tx_number: global.count,
                    source: source_key,
                    destination: dest_key,
                    amount,
                });
            }

            msg!("Exempt transfer: {} raw units (DEX/whitelisted)", amount);
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
            // Unregistered wallets cannot transfer — must register first
            // (Exempt addresses still bypass via the exempt check above)
            msg!("Wallet not registered. Register with The Oracle first.");
            return err!(HogeError::WalletNotRegistered);
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

    /// Admin: initialize the exempt address list
    pub fn init_exempt_list(ctx: Context<InitExemptList>) -> Result<()> {
        let list = &mut ctx.accounts.exempt_list;
        list.admin = ctx.accounts.admin.key();
        list.count = 0;
        list.addresses = vec![];
        msg!("Exempt list initialized.");
        Ok(())
    }

    /// Admin: add an address to the exempt list (e.g. DEX pool vault)
    pub fn add_exempt(ctx: Context<ModifyExemptList>, address: Pubkey) -> Result<()> {
        let list = &mut ctx.accounts.exempt_list;
        require!(list.count < 16, HogeError::ExemptListFull);
        require!(!list.addresses.contains(&address), HogeError::AlreadyExempt);
        list.addresses.push(address);
        list.count += 1;
        msg!("Added exempt address: {}", address);
        Ok(())
    }

    /// Admin: remove an address from the exempt list
    pub fn remove_exempt(ctx: Context<ModifyExemptList>, address: Pubkey) -> Result<()> {
        let list = &mut ctx.accounts.exempt_list;
        let pos = list.addresses.iter().position(|a| a == &address);
        require!(pos.is_some(), HogeError::NotExempt);
        list.addresses.swap_remove(pos.unwrap());
        list.count = list.count.checked_sub(1).ok_or(HogeError::Overflow)?;
        msg!("Removed exempt address: {}", address);
        Ok(())
    }

    /// Admin: reinitialize the ExtraAccountMetaList with exempt list support.
    /// Reallocs the existing PDA and rewrites with 4 extra accounts.
    pub fn reinitialize_extra_account_meta_list(
        ctx: Context<ReinitializeExtraAccountMetaList>,
    ) -> Result<()> {
        let extra_metas = get_extra_account_metas();
        let account_size = ExtraAccountMetaList::size_of(extra_metas.len())
            .map_err(|_| ErrorCode::AccountDidNotSerialize)?;

        let account_info = ctx.accounts.extra_account_meta_list.to_account_info();

        // Top up rent first (before realloc, since we need CPI for lamport transfer)
        let old_size = account_info.data_len();
        if account_size > old_size {
            let rent = Rent::get()?;
            let new_min = rent.minimum_balance(account_size);
            let current_lamports = account_info.lamports();
            if current_lamports < new_min {
                let diff = new_min - current_lamports;
                system_program::transfer(
                    CpiContext::new(
                        ctx.accounts.system_program.to_account_info(),
                        system_program::Transfer {
                            from: ctx.accounts.payer.to_account_info(),
                            to: account_info.clone(),
                        },
                    ),
                    diff,
                )?;
            }

            account_info.realloc(account_size, true)?;
        }

        // Zero existing data then rewrite
        {
            let mut data = account_info.try_borrow_mut_data()?;
            data.fill(0);
        }

        ExtraAccountMetaList::init::<ExecuteInstruction>(
            &mut account_info.try_borrow_mut_data()?,
            &extra_metas,
        )
        .map_err(|_| ErrorCode::AccountDidNotSerialize)?;

        msg!("ExtraAccountMetaList reinitialized with exempt list support.");
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
        // [8] Exempt list PDA: ["exempt-list"]
        ExtraAccountMeta::new_with_seeds(
            &[Seed::Literal {
                bytes: EXEMPT_LIST_SEED.to_vec(),
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
        init,
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

    /// Exempt address list (read-only)
    #[account(
        seeds = [EXEMPT_LIST_SEED],
        bump,
    )]
    pub exempt_list: Account<'info, ExemptList>,
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

#[derive(Accounts)]
pub struct InitExemptList<'info> {
    #[account(mut, constraint = admin.key() == config.admin @ HogeError::Unauthorized)]
    pub admin: Signer<'info>,

    #[account(seeds = [CONFIG_SEED], bump)]
    pub config: Account<'info, HookConfig>,

    #[account(
        init, payer = admin, space = 8 + ExemptList::INIT_SPACE,
        seeds = [EXEMPT_LIST_SEED], bump,
    )]
    pub exempt_list: Account<'info, ExemptList>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ModifyExemptList<'info> {
    #[account(constraint = admin.key() == exempt_list.admin @ HogeError::Unauthorized)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [EXEMPT_LIST_SEED], bump,
    )]
    pub exempt_list: Account<'info, ExemptList>,
}

#[derive(Accounts)]
pub struct ReinitializeExtraAccountMetaList<'info> {
    #[account(mut, constraint = payer.key() == config.admin @ HogeError::Unauthorized)]
    pub payer: Signer<'info>,

    /// CHECK: Just need pubkey
    pub mint: UncheckedAccount<'info>,

    /// CHECK: Will be closed and recreated
    #[account(
        mut,
        seeds = [EXTRA_METAS_SEED, mint.key().as_ref()],
        bump,
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,

    #[account(seeds = [CONFIG_SEED], bump)]
    pub config: Account<'info, HookConfig>,

    pub system_program: Program<'info, System>,
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

#[account]
#[derive(InitSpace)]
pub struct ExemptList {
    pub admin: Pubkey,
    pub count: u8,
    #[max_len(16)]
    pub addresses: Vec<Pubkey>,
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
    #[msg("Exempt list is full (max 16 addresses)")]
    ExemptListFull,
    #[msg("Address is already exempt")]
    AlreadyExempt,
    #[msg("Address is not in exempt list")]
    NotExempt,
    #[msg("Wallet not registered. Register with The Oracle to trade.")]
    WalletNotRegistered,
}
