# Claude Code Task: Daily Commit & Push

> Diesen Prompt in Claude Code als wiederkehrenden Task einrichten.
> Alternativ: Als git hook oder cron job auf dem lokalen Rechner.

## Aufgabe

Prüfe das Portal Repo auf uncommittete Änderungen (z.B. neue SEO City Pages von Cowork), 
erstelle einen sauberen Commit und push nach main. Vercel deployed automatisch.

## Ablauf

1. `git status` — wenn clean, beenden
2. `git diff --name-only` + `git ls-files --others --exclude-standard` — Änderungen auflisten
3. Prüfen: Keine .env, credentials oder secrets in den Änderungen
4. Commit Message nach Typ:
   - Nur City Pages: `feat(seo): add city pages [stadt/kategorie, ...]`
   - Nur Code: `feat/fix/refactor: [Beschreibung]`
   - Gemischt: `chore: daily sync — [kurze Zusammenfassung]`
5. `git add -A && git commit`
6. `git push origin main`
7. Bei Push-Fehler: `git pull --rebase origin main && git push` — bei erneutem Fehler stoppen

## Regeln

- NIEMALS force-push
- NIEMALS Dateien ändern, nur committen was da ist
- Keine generischen Messages ("update files")
- Bei >20 Dateien: Zusammenfassung in Commit Message Body
- Wenn nichts zu tun: Kurz melden, beenden

## Empfohlener Schedule

Täglich 18:00 Uhr — fängt alles auf was Cowork tagsüber geschrieben hat.
