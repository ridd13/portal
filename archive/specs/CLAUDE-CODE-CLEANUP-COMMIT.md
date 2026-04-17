# Claude Code Task: Repo-Cleanup committen + offene Specs umsetzen

> Cowork hat das Repo aufgeräumt. Bitte committen und dann die offenen Specs abarbeiten.

## 1. Cleanup committen

Folgende Änderungen sind bereits durchgeführt und müssen nur committed werden:

### Archiviert (erledigte Specs → `archive/specs/`)
20 abgeschlossene CLAUDE-CODE-*.md Specs (V2–V8, Landing, Fonts, Logo, Fixes, Map-Cleanup, SEO-Fixes, Host-Dashboard, Continue-Import, Event-Intake, Event-Pipeline-Fixes, Double-Optin, Pipeline-Review)

### Archiviert (Cowork-Session-Artefakte → `archive/cowork-docs/`)
5 Docs die nicht ins Repo gehören: COWORK-PROJEKTHINWEISE.md, GLOBALE-ANWEISUNGEN-VORSCHLAG.md, PROMPT-JC-PROJEKTE.md, PROJEKTHINWEISE-CLAUDE-STRATEGE.md, portal-bauplan.md

### Neu hinzugefügt
- `knowledge/event-intake-nils-liebt-dich-scraping.md` — Research-Notiz zum NILS-Scraping

### Commit-Befehle

```bash
git add archive/ knowledge/ 
git add -u  # tracked files die verschoben wurden
git status  # prüfen ob alles stimmt

git commit -m "chore: archive 20 completed specs + 5 cowork docs, add NILS scraping knowledge

- Move 20 completed CLAUDE-CODE-*.md specs to archive/specs/
- Move 5 cowork session artifacts to archive/cowork-docs/
- Add knowledge/event-intake-nils-liebt-dich-scraping.md
- Root now only contains 4 open specs + project docs"
```

## 2. Offene Specs (Prio-Reihenfolge)

Nach dem Cleanup-Commit diese Specs abarbeiten:

1. **CLAUDE-CODE-JSONLD-FIX.md** — GSC Structured Data (5 fehlende Felder). Quickest win.
2. **CLAUDE-CODE-REGISTRATION-REDESIGN.md** — Anmelde-Form komplett neu: 2 Felder statt 6, Form unter Beschreibung verschieben, Preis-Bug fixen.
3. **CLAUDE-CODE-CLAIM-FLOW.md** — Ownership-Claiming für Drittpartei-Einträge. DB-Migration + neue Components + E-Mail.
4. **CLAUDE-CODE-DAILY-COMMIT.md** — Täglicher Auto-Commit (optional, low prio).

Jeder Spec hat seine eigene Reihenfolge und Anforderungen — lies den jeweiligen Spec komplett bevor du anfängst.

**Wichtig:** Nach jedem Spec `npm run build` grün → eigener Commit → nächster Spec.

## 3. Aufräum-Regel (ab jetzt)

Wenn ein Spec vollständig umgesetzt und committed ist:
```bash
mv CLAUDE-CODE-[NAME].md archive/specs/
git add -u && git add archive/specs/
git commit -m "chore: archive completed spec [NAME]"
```

So bleibt das Root sauber.
