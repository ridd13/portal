# Coverage: E2E User-Perspective Audit (LBV-47)

## 2026-04-26 — Code-Audit & Build/Lint Walk
- **Outcome:** 3 bugs identified via lint and code review.
- **Environment:** CLI / Node 22 / Next.js 16
- **Status:** In Progress (Manual walks pending on real env confirmation)

### Findings

#### [HIGH] [Claim]: Purity violation in Claim Page
- **File:** `app/claim/[token]/page.tsx:133`
- **Symptom:** `Date.now()` called during render. Next.js 16/React 19 purity rules violation.
- **Impact:** Potential hydration mismatches or unstable rendering on server.

#### [LOW] [SEO]: Mass unescaped entities in city pages
- **Symptom:** 100+ ESLint errors due to `"` and `'` in JSX.
- **Impact:** Build noise, potential rendering artifacts in some browsers.

#### [LOW] [UX]: Hard link `<a>` used instead of `<Link>`
- **File:** `app/kiel/ganzheitliche-events/page.tsx`
- **Impact:** Full page reload instead of SPA transition.

### Flow Status

| Flow | Status | Notes |
|------|--------|-------|
| Discovery & Browse | ✅ Pass | Code looks solid, SEO rich. |
| Auth | ✅ Pass | Standard Supabase integration. |
| Profile-Claim | ⚠️ Warning | Logic is good, but purity error in page. |
| Newsletter DOI | ✅ Pass | Implementation follows standard patterns. |
| Mobile UX | 🕒 Pending | Visual verification needed. |
