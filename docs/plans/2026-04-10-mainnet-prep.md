# Mainnet Prep — Plan

**Date:** 2026-04-10
**Status:** Planning

---

## DEX Strategy

### Orca Whirlpool (PRIMARY TARGET)
Orca supports Token-2022 via TokenBadge, but requires:
- ✅ Publicly available TransferHook code (verifiable build)
- ❌ **No upgrade authority** — we currently retain it for iteration
- ❌ **TransferHook cannot block transfers** — our hook blocks (daily limit + 109th trap)
- ✅ No FreezeAuthority

**Problem:** Our hook's sell limit and 109th-tx trap intentionally block transfers. Orca won't badge a token whose hook can reject transfers.

**Options:**
1. **Exempt DEX pool vaults** — modify hook to whitelist Orca pool vault addresses (transfers to/from pool vaults skip the limit check). This preserves the limit for P2P transfers while allowing DEX trading.
2. **Remove blocking behavior for mainnet** — change hook to log-only mode (track but don't reject). Loses the meme mechanic.
3. **Deploy separate mainnet hook** — mainnet version has softer rules (whitelist-based exemptions). Devnet keeps the aggressive version for testing.

**Recommendation:** Option 1 — add a whitelist of exempt addresses to the hook's config PDA. Admin can add DEX vault addresses. Hook checks: if source or destination is whitelisted, skip daily limit check.

### Jupiter
Automatic routing once we have liquidity on any supported DEX (~10-20 SOL minimum pool). No application needed.

### Raydium
Not an option — hard-blocks TransferHook + PermanentDelegate.

---

## Pre-Mainnet Checklist

### 1. Hook Whitelist Feature (REQUIRED for DEX)
- Add `exempt_addresses: Vec<Pubkey>` to hook config (or separate PDA)
- Add `add_exempt` / `remove_exempt` admin instructions
- Hook's execute_transfer checks: if source or dest in exempt list → skip daily limit
- Deploy + test on devnet

### 2. Security Audit
- **Scope:** TransferHook + Hibernate program (Burrow is simple x*y=k, lower risk)
- **Firms:** CyberScope (~$3-5K), Zealynx, OtterSec (premium)
- **Timeline:** 1-2 weeks for small programs
- **Alternative:** Community review + Verifiable Build (cheaper, lower assurance)

### 3. Mainnet Keypair Setup
- Generate fresh mainnet admin keypair (NOT the devnet one)
- Fund with ~5 SOL for deployments
- Consider Squads multisig for governance (upgrade authority, shadow ceremony)
- Store seed phrase in hardware wallet / secure backup

### 4. Disable Upgrade Authority (after audit)
- Run: `solana program set-upgrade-authority <PROGRAM_ID> --final`
- Do this for ALL three programs (hook, burrow, hibernate)
- **Only after everything is verified and audited**

### 5. Token Creation (Mainnet)
- New mint with same extensions (TransferFeeConfig, TransferHook, PermanentDelegate)
- Point TransferHook to mainnet hook program
- Mint initial supply (1,883,000,000 $HOGE)
- Create Metaplex metadata (reuse Arweave logo/JSON)

### 6. Liquidity Setup
- Create Orca Whirlpool pool ($HOGE/SOL)
- Seed with initial liquidity (recommend 50-100 SOL equivalent)
- Apply for TokenBadge once pool is live and hook is whitelisted

### 7. Token Listing
- **Jupiter:** Automatic once liquidity exists
- **CoinGecko/CMC:** Apply after 10-20 SOL daily volume
- **Birdeye/DexScreener:** Automatic indexing

---

## Deployment Order

1. Hook whitelist feature (devnet) → test
2. Security review / audit
3. Generate mainnet keypair + Squads multisig
4. Deploy hook → burrow → hibernate to mainnet
5. Create mainnet token + metadata
6. Whitelist pool vaults in hook
7. Create Orca pool + seed liquidity
8. Apply for TokenBadge
9. Disable upgrade authorities
10. Shadow Ceremony ready for Feb 2, 2027
