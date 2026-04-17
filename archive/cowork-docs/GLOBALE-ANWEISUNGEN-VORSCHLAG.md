# Globale Anweisungen (User Instructions) — Vorschlag

> Ersetzt die aktuelle globale CLAUDE.md. Enthält nur was IMMER gilt,
> unabhängig vom Projekt.

---

## Activity Logging — Automatisch (Cowork)

Nach jeder abgeschlossenen Aufgabe oder jedem Meilenstein in einer Cowork-Session:

1. **Prüfe ob ein Activity Log für heute existiert:**
   - Pfad: 02-Tasks/[JAHR]/[MM-Mon]/[HEUTE]_Activity-Log_Lennert.md
   - Monatsordner: MM-Mon Format (01-Jan, 02-Feb, ..., 12-Dec)
   - Falls nicht vorhanden: Erstelle es mit Frontmatter:
     type: task, status: active, category: activity-log, date: [HEUTE], owner: lennert, entries: 0
   - Den Vault-Ordner mit 02-Tasks/ darin finden — kann je nach Projekt unterschiedlich gemountet sein.

2. **Hänge einen Eintrag ans Activity Log an:**
   ### [UHRZEIT] – [Kurztitel max 5 Wörter]
   - **Was:** 1-2 Sätze
   - **Ergebnis:** Konkretes Deliverable, Datei als [[Wikilink]], oder Entscheidung
   - **Status:** ✅ erledigt | 🔄 in Arbeit | ⏸️ pausiert
   - **Tags:** #bereich (z.B. #sales #crm #content #portal #intern #automation)

3. **Aktualisiere Frontmatter:** entries +1, updated auf heute

4. **Wissen im Vault ablegen:**
   - Wenn du etwas Neues lernst oder einen Prozess entwickelst: Im passenden Vault ablegen
   - Verlinke neue Dateien im Activity Log als [[Wikilink]]
   - Wo genau abgelegt wird, hängt vom Projekt ab (siehe Projekthinweise)

Regeln:
- Logge jede substanzielle Aktion, nicht jede Mini-Änderung
- Bei längeren Tasks: Log bei Start (🔄) und bei Abschluss (✅)
- Uhrzeit per Bash ermitteln: date +%H:%M

---

## Safe Delete — PFLICHT bei jedem Vault-Cleanup

> **KRITISCH: Niemals `rm`, `rm -rf`, `unlink` oder Lösch-Scripts auf Vault-Dateien anwenden.**

Statt löschen → umbenennen mit Prefix + Grund:
```
delete_[originalname]_[grund]
```
Suffixe: `_empty`, `_duplicate`, `_newer_version`, `_obsolete`, `_merged`, `_moved`

Regeln:
- Markierte Dateien bleiben mindestens 7 Tage als Review-Phase
- Nur der User löscht `delete_*` Dateien — über Finder (Papierkorb), nie per Terminal
- macOS ist case-insensitive: `Content` = `content` = derselbe Ordner!
- Vor Operationen mit >5 Dateien: Plan zeigen, Bestätigung abwarten
- Keine Cleanup-Scripts erstellen die `rm` enthalten
