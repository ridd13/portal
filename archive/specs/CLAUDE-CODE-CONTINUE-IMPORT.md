# Event-Import fortsetzen — Rest-Batch

## Kontext
Der erste Backfill-Run (30 Tage, 49 Telegram-Gruppen) wurde gestern gestartet. Die Klassifizierung ist fertig, ~1.011 Events wurden erkannt. 52 Events + 201 Hosts sind bereits in Supabase. Der Rest wurde unterbrochen (Vault-Pfad-Wechsel).

## Was zu tun ist

Die verbleibenden Events aus den JSON-Batch-Dateien verarbeiten und in Supabase einfügen. Die Dateien liegen unter `~/telegram_scraper/`:

```bash
ls ~/telegram_scraper/batch_*.json
```

## Bereits in Supabase (NICHT nochmal einfügen)

52 Events sind schon drin. Prüfe vor jedem Insert per source_message_id:
```sql
SELECT source_message_id FROM events WHERE source_type = 'telegram';
```

## Vorgehen

1. **Lies die Batch-Dateien** unter `~/telegram_scraper/` — vermutlich `batch_rest_future.json` oder ähnlich
2. **Für jedes Event:** Prüfe ob source_message_id schon in Supabase → Skip wenn ja
3. **Host-Matching:** Erst per telegram_username, dann Name. 201 Hosts sind schon angelegt.
4. **Event einfügen** mit `status: 'published'`, `is_public: true`, `source_type: 'telegram'`
5. **SEO description_sections** generieren — Regeln siehe `~/Documents/Second Brain/p-das-portal/pipeline/skill/references/copywriting-rules.md`
6. **Pipeline-Log** schreiben: Für jeden Insert ein Eintrag in `pipeline_log` Tabelle:
   ```sql
   INSERT INTO pipeline_log (action, table_name, record_id, record_title, source)
   VALUES ('insert', 'events', '[id]', '[title]', 'backfill-batch-2');
   ```

## Supabase
- Projekt-ID: fjyaolxtipqtcvvclegl
- Nutze execute_sql MCP für alle DB-Operationen

## Regeln
- Alle Texte auf Deutsch
- Slug: Kleinbuchstaben, Bindestriche, keine Umlaute, max 60 Zeichen
- Timezone: Europe/Berlin
- Tags: lowercase, max 5 pro Event
- Wenn unsicher: `status: 'draft'`
- Preis: 'free' | 'donation' | 'paid'

## Statistik am Ende
Gib aus:
- Neue Events eingefügt: X
- Übersprungen (Duplikat): X
- Neue Hosts angelegt: X
- Regionen-Verteilung
