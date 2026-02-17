# Portal

Next.js Event-Plattform (App Router, TypeScript, Tailwind v4) mit Supabase.

## Local Setup

```bash
npm install
npm run dev
```

## Required Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Sentry (optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

## Security Notes

- Auth fuer `/konto` ist serverseitig geschuetzt (Middleware + HttpOnly Session-Cookies).
- Login/Signup/Passwort-Reset nutzen serverseitige Turnstile-Verifikation.
- Rechtstexte in `app/impressum` und `app/datenschutz` sind Vorlagen und muessen final juristisch geprueft werden.
