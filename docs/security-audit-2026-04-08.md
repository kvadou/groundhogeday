# Security Audit — groundhogeday
**Date:** 2026-04-08
**Auditor:** Claude Code (security-audit skill)

## Stack Detection

- **Framework:** Next.js 16.2.3 (App Router)
- **Language:** TypeScript 5, strict mode ON
- **ORM / DB:** None — fully static, no database
- **Auth:** None — no authentication system
- **Deployment:** Vercel (`.vercel/project.json` present)
- **Backend / API:** None — zero API routes, pure static frontend
- **External Services:** None detected (no Stripe, no webhooks, no email)
- **Character:** Meme/crypto landing page for $HOGE token ("Groundhoge Day")

---

## Scorecard

```
=================================================================
SECURITY AUDIT SCORECARD — groundhogeday
Date: 2026-04-08
Stack: Next.js 16 (static) · TypeScript 5 · Vercel · No DB · No Auth
=================================================================

TRACK A — OWASP & Auth Security
 #1  Rate Limiting .............. N/A       (no API routes)
 #2  Auth Token Storage ......... N/A       (no auth)
 #3  Input Sanitization ......... N/A       (no forms / API routes)
 #4  Hardcoded API Keys ......... PASS      CRITICAL (no secrets found in source)
 #5  Webhook Verification ....... N/A       (no webhooks)
 #8  Session Expiry ............. N/A       (no sessions)
 #10 Password Reset Expiry ...... N/A       (no auth / passwords)
 #16 Admin Role Checks .......... N/A       (no admin routes)

TRACK B — Data & Performance
 #6  Database Indexing .......... N/A       (no database)
 #9  Pagination ................. N/A       (no database queries)
 #15 Connection Pooling ......... N/A       (no database)
 #19 Backup Strategy ............ N/A       (static site, no user data)

TRACK C — Frontend & Resilience
 #7  Error Boundaries ........... FAIL      MEDIUM
 #11 Env Var Validation ......... PASS      MEDIUM (no env vars used)
 #12 Image Upload Strategy ...... N/A       (no uploads)
 #13 CORS Policy ................ PASS      HIGH (Next.js same-origin, no custom headers)
 #14 Async Email Sending ........ N/A       (no email)
 #18 Production Logging ......... FAIL      HIGH

TRACK D — Infrastructure & TypeScript
 #17 Health Check Endpoint ...... FAIL      MEDIUM
 #20 TypeScript Strict Mode ..... PASS      HIGH (strict: true, 0 `any` in source)

=================================================================
SCORE: 3/5 applicable checks passed | 0 critical | 1 high | 2 medium
       (15 checks N/A — static site has no backend surface)
=================================================================
```

---

## Findings Detail

### FAIL — Check #7: No Error Boundaries (MEDIUM)

**What's wrong:** No `error.tsx` in `app/`, no `ErrorBoundary` component wrapping the app. If any client component throws (e.g., `OracleTerminal.tsx` with its date math), the entire page crashes to a blank screen.

**Risk:** Full page white-screen on any runtime JS error. For a meme/landing page this is credibility-destroying.

**Fix:** Add `app/error.tsx`:
```tsx
"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-[#ffaa00] font-mono text-sm">THE ORACLE HAS MALFUNCTIONED</p>
      <button onClick={reset} className="mt-4 text-xs text-[#666] underline">Try again</button>
    </div>
  );
}
```
**Effort:** Quick fix (< 15 min)

---

### FAIL — Check #18: No Production Logging (HIGH)

**What's wrong:** No structured logging, no Sentry/LogRocket/Datadog, no error tracking service configured. Client-side errors (JS exceptions, failed renders) are invisible in production.

**Risk:** Silent failures in production — you'll never know if `OracleTerminal.tsx` date math crashes for certain users, or if the countdown clock breaks on Feb 2.

**Fix (Option A — free, 5 min):** Add Vercel's built-in Speed Insights + Web Analytics in `layout.tsx`:
```tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
// Add <Analytics /> and <SpeedInsights /> in RootLayout body
```

**Fix (Option B — recommended for error tracking):** Add Sentry (free tier):
```bash
npx @sentry/wizard@latest -i nextjs
```
**Effort:** Quick fix (< 30 min)

---

### FAIL — Check #17: No Health Check Endpoint (MEDIUM)

**What's wrong:** No `/api/health` route. Vercel handles deployment health natively, but there's no uptime monitoring endpoint to ping from external services (UptimeRobot, Betterstack, etc.).

**Risk:** Low for a static site — Vercel CDN handles availability. But if you add any server logic later, you'll want this in place.

**Fix:** Add `app/api/health/route.ts`:
```ts
export async function GET() {
  return Response.json({ status: "ok", ts: Date.now() });
}
```
Then configure UptimeRobot to ping `https://yourdomain.com/api/health` every 5 min.
**Effort:** Quick fix (< 10 min)

---

## Top 3 Fixes (Priority Order)

| Priority | Check | Action | Effort |
|----------|-------|--------|--------|
| 1 | #18 Production Logging | Add Sentry or Vercel Analytics | < 30 min |
| 2 | #7 Error Boundaries | Add `app/error.tsx` | < 15 min |
| 3 | #17 Health Check | Add `/api/health` route + UptimeRobot | < 10 min |

---

## Notable Positives

- **TypeScript strict mode is ON** — `tsconfig.json` has `"strict": true`, zero `any` in source files.
- **No secrets in source** — no API keys, tokens, or credentials found anywhere in the codebase.
- **`.gitignore` covers `.env*`** — env files properly excluded from git.
- **No auth surface** — eliminates the entire OWASP Top 10 auth attack surface.
- **No database** — no SQL injection, no connection pooling, no backup concerns.
- **CORS not needed** — same-origin Next.js app on Vercel, no custom CORS headers required.

---

## Context Note

This is a static meme/landing page for a crypto token. The security posture is excellent for what it is — the 15 N/A checks reflect a deliberately minimal architecture. The 3 failures are all best-practice gaps (observability, resilience) rather than active vulnerabilities. Nothing here is exploitable. Fix #18 (logging) before any traffic campaign so you have visibility.
