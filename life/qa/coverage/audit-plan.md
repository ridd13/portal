# Test Plan: E2E User-Perspective Audit (LBV-47)

## 1. Discovery & Browse (Demand Side)
- **Home:** Hero section, CTA "Events finden", responsive behavior.
- **City Hubs:** `/hamburg`, `/kiel`, `/berlin` - list rendering, SEO titles.
- **Filtering:** Date filters, Category filters (Tags).
- **Event Detail:** `/events/[slug]` - Image, content rendering, Host info, ICS download.
- **Provider Directory:** `/anbieter` - List of hosts, filtering, map view.
- **SEO:** Check `<title>`, `<meta description>`, and `application/ld+json` for events.

## 2. Auth & Account
- **Signup:** Register with email (Magic Link/Password).
- **Login/Logout:** Session persistence and clean cleanup.
- **Protection:** Verify `/konto` subpages are protected.

## 3. Provider Workflow (Supply Side - LBV-48)
- **Claim Workflow:**
    - Use `/claim/[token]` with a valid token.
    - Verify Magic Link email triggers.
    - Verify landing on `/konto/profil?claimed=1` after callback.
- **Profile Management:**
    - Update Bio, Website, Social Links in `ProfileEditor`.
    - Upload/Change Logo (if supported).
    - Verify persistence after hard reload.
- **Submission:**
    - Submit a new Event via `/einreichen/event`.
    - Submit a new Host via `/einreichen/host`.
    - Submit a new Location via `/einreichen/location`.

## 4. Newsletter / Waitlist
- **Form:** Submit email to waitlist (`WaitlistForm`).
- **DOI:** Verify Double-Opt-In flow (Confirmation email).

## 5. Environments
- **Desktop:** Chrome (latest) @ 1440x900.
- **Mobile:** Simulated iOS Safari (iPhone 14, 393x852).

## 6. Performance
- **Lighthouse:** Run on Home and Event Detail pages.

## Success Criteria
- No blocking errors in core flows.
- Clean mobile UX (no horizontal scrolling, tap targets accessible).
- Accurate SEO data for indexing.
- Successful Profile-Claim without manual SQL intervention.
