# Prompt: Event-Pipeline Review & Skill-Optimierung

## Kontext

Du hast gerade einen großen Telegram-Backfill durchgeführt: 504 Events aus Telegram-Nachrichten geparst, strukturiert und in Supabase eingefügt. Das war der erste vollständige Durchlauf der Event-Pipeline.

**Ergebnis:**
- 700 Events total in Supabase (source: telegram)
- 284 Unique Hosts
- 26 SQL-Batches fehlerfrei
- 504 Pipeline-Log-Einträge
- Formate: Event (366), Retreat (213), Workshop (71), Kreis (21), Kurs (18), Festival (11)

## Aufgabe

### Phase 1: Retro — Was lief, was nicht?

Geh deine eigene Arbeit durch und analysiere:

1. **Effizienz-Analyse:**
   - Wie viele API-Calls / SQL-Statements hast du gebraucht? War das optimal?
   - Gab es unnötige Roundtrips (z.B. einzelne Lookups statt Batch-Queries)?
   - Wo hast du Zeit verloren (Retry-Loops, falsche Annahmen, Korrekturen)?
   - Wie war das Verhältnis von Classify → Extract → Insert? Gab es Bottlenecks?

2. **Qualitäts-Check (Stichprobe):**
   - Ziehe 10-15 zufällige Events aus Supabase und prüfe:
     - Sind Titel sinnvoll? (Nicht zu lang, nicht zu kurz, deutsch, klar)
     - Stimmen die Formate? (Retreat vs. Workshop vs. Ceremony etc.)
     - Sind Tags passend? (Lowercase, relevant, nicht zu viele)
     - Stimmen start_at / end_at? (Timezone korrekt, nicht in der Vergangenheit)
     - Host korrekt zugeordnet?
     - Slug-Format eingehalten?
   - Dokumentiere Fehler-Patterns (z.B. "Retreats oft als Workshop getaggt")

3. **Dedup-Analyse:**
   - Gibt es Duplikate in der DB? Query:
     ```sql
     SELECT title, start_at, COUNT(*)
     FROM events
     WHERE source_type = 'telegram'
     GROUP BY title, start_at
     HAVING COUNT(*) > 1;
     ```
   - Gibt es Host-Duplikate? (Gleiche Person, verschiedene Schreibweisen)
     ```sql
     SELECT name, COUNT(*)
     FROM hosts
     GROUP BY name
     HAVING COUNT(*) > 1;
     ```

4. **Pipeline-Log Auswertung:**
   - Wie viele insert vs. skip vs. error Einträge?
   - Welche Fehler kamen am häufigsten vor?

### Phase 2: Learnings dokumentieren

Schreibe die Erkenntnisse als Datei:
**Pfad:** `p-das-portal/pipeline/skill/references/backfill-learnings.md`

Struktur:
```markdown
---
type: knowledge
category: pipeline
date: 2026-04-01
owner: claude-code
---

# Backfill Learnings — 01.04.2026

## Statistik
[Zahlen aus Phase 1]

## Was gut lief
[Konkrete Punkte]

## Was schlecht lief / Fehler-Patterns
[Konkrete Punkte mit Beispielen]

## Optimierungsvorschläge
[Für den Skill / die nächste Pipeline-Execution]
```

### Phase 3: Skill optimieren

Basierend auf den Learnings, aktualisiere den Event-Pipeline Skill:
**Pfad:** `p-das-portal/pipeline/skill/SKILL.md`

Konkret anpassen:
- **Batch-Sizes:** Sind 20-30 Nachrichten pro Classify-Batch optimal? Oder mehr/weniger?
- **Dedup-Logik:** Hat die Dedup gut funktioniert? Braucht es strengere/lockerere Kriterien?
- **Format-Mapping:** Sind die Format-Keywords vollständig? Fehlten welche?
- **Host-Matching:** Hat Name-Matching funktioniert? Fuzzy-Match nötig?
- **SQL-Batching:** Wie viele Events pro Insert-Batch sind optimal?
- **Fehlerbehandlung:** Wo braucht es bessere Fallbacks?

**Wichtig:** Keine Breaking Changes am Skill — nur Verbesserungen und Ergänzungen. Markiere Änderungen mit `<!-- UPDATED 2026-04-01: [Grund] -->` als Kommentar.

### Phase 4: SOP schreiben

Erstelle eine SOP für den manuellen Backfill-Prozess:
**Pfad:** Im Vault unter `knowledge/SOPs/sop-event-backfill.md`

```markdown
---
type: sop
category: pipeline
date: 2026-04-01
owner: lennert
status: active
---

# SOP: Event-Backfill aus Telegram

## Wann nötig?
[Szenarien: Neue Gruppe, DB-Reset, Lücken füllen]

## Voraussetzungen
[Keys, Zugang, Tools]

## Schritt-für-Schritt
[Basierend auf deinen tatsächlichen Erfahrungen — was du WIRKLICH gemacht hast, nicht was theoretisch im Skill steht]

## Bekannte Fallstricke
[Aus Phase 1]

## Zeitschätzung
[Basierend auf dem tatsächlichen Durchlauf]
```

## Regeln

- **Vault-Pfad:** Alle Dateien relativ zum Workspace-Root schreiben
- **Supabase:** Nutze die MCP-Tools (execute_sql) für Queries
- **Ehrlichkeit:** Wenn etwas schlecht lief, sag es. Das ist eine Retro, kein Marketing.
- **Kein Cleanup:** Keine Events löschen oder ändern in dieser Session — nur analysieren und dokumentieren
- **Activity Log:** Trage die Ergebnisse ins Activity Log ein (02-Tasks/2026/04-Apr/2026-04-01_Activity-Log_Lennert.md)
