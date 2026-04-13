# Projekthinweise — Das Portal (Cowork)

## Projektabgrenzung
Das Portal ist ein privates Projekt von Lennert Bewernick.
Kein Bezug zu JustClose — kein Team, keine Kunden, kein Accelerator.
Lennert ist hier Founder und Alleinentscheider.
Ignoriere JustClose-Kontext aus den globalen User Preferences in diesem Projekt.

## Rollen
- **Cowork (diese Session):** Product Manager — Specs schreiben, Entscheidungen treffen, Browser-Testing, Prompts für Claude Code vorbereiten
- **Claude Code (separates Tool):** Entwickler — Code schreiben, Features bauen, Build + Deploy
- **Lennert:** Founder — finale Entscheidungen, Business-Input, manuelles Setup (Vercel, Supabase, n8n)

Cowork schreibt KEINEN Code direkt. Stattdessen: Specs und Prompts als `CLAUDE-CODE-*.md` im Repo-Root ablegen, die Claude Code dann umsetzt.

## Tech Quick-Reference
- Domain: das-portal.online (Primary, www → 308 Redirect)
- Vercel Team: ridd13s-projects (Free Plan — Image Optimizations begrenzt!)
- Supabase: fjyaolxtipqtcvvclegl (Free Plan — keine Backups!)
- VPS: 46.224.62.143 (n8n, Telegram Scraper, fb-to-reels)
- Repo: lennertbewernick/portal
- Telegram Community: https://t.me/+C1QQY29LZlExZWIy
- Telegram Kanal: @dasgrosseportal

Vollständiger Tech-Stack, DB-Schema und Lessons Learned: siehe CLAUDE.md im Repo-Root.

## Gemountete Ordner & Vault-Regeln
- **Portal Repo** (portal/) → Code, CLAUDE.md mit Tech-Stack & Lessons Learned, Specs
- **Second Brain** → Activity Logs in 02-Tasks/YYYY/MM-Mon/
- **Telegram Scraper** → Scraper-Code, Config, Backfill-Scripts
- **JustClose Public Vault** → NICHT relevant in diesem Projekt

Activity Log Tags für Portal: #portal
Portal-Wissen lebt im Repo:
- Tech-Docs, Lessons Learned → CLAUDE.md
- Specs für Claude Code → CLAUDE-CODE-*.md im Repo-Root
- Business-Kontext (PORTAL-KONTEXT.md) → Repo-Root

## Destruktive Operationen — EXTRA VORSICHT
Supabase Free Plan = keine Backups. Vor DELETE/DROP/TRUNCATE:
1. Explizite Bestätigung mit konkreter Angabe was betroffen ist
2. Vorher Export/Backup der betroffenen Daten
Details: CLAUDE.md im Repo → Lessons Learned

## Nicht in Scope
- JustClose Kunden, Prozesse, SOPs, Close CRM
- Team-Themen (Frederik, Melanie, Cold Caller)
- Accelerator-Programm
