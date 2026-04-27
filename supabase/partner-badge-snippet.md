# Partner Badge — HTML Snippet

Für Partner-Websites. `{partner_slug}` durch den tatsächlichen Host-Slug ersetzen (z.B. `school-of-movement`).

## HTML-Snippet (für Website)

```html
<a href="https://das-portal.online/?utm_source=partner&utm_medium=badge&utm_campaign={partner_slug}"
   target="_blank" rel="noopener"
   style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px;
          font-family: system-ui, -apple-system, sans-serif; font-size: 13px;
          color: #2c2418; background: #faf6f1; border: 1px solid #e5ddd3;
          border-radius: 6px; text-decoration: none;">
  <img src="https://das-portal.online/badge-icon.svg" alt="" width="16" height="16">
  <span>Powered by Das Portal</span>
</a>
```

## SVG Assets (für Newsletter / Story-Overlays)

| Datei | Größe | Beschreibung |
|-------|-------|-------------|
| `/badge/das-portal-badge-32.svg` | 32×32 px | Icon-only, für kleine Einbettungen |
| `/badge/das-portal-badge-64.svg` | 64×64 px | Icon-only, mittelgroß |
| `/badge/das-portal-badge-256.svg` | 256×80 px | Vollständig mit Text, für Newsletter |
| `/badge-icon.svg` | 16×16 px | Inline-Icon für HTML-Snippet |

## UTM-Tracking

Alle Badge-Links tragen:
- `utm_source=partner`
- `utm_medium=badge`
- `utm_campaign={partner_slug}` — individuell pro Partner

In Plausible Analytics sind UTM-Parameter automatisch getrackt.
Zur Überprüfung: Plausible Dashboard → Sources → utm_source=partner.

## Admin: Featured-Status setzen

```sql
-- Featured aktivieren
UPDATE hosts SET is_featured = true WHERE slug = 'school-of-movement';

-- Featured deaktivieren
UPDATE hosts SET is_featured = false WHERE slug = 'school-of-movement';
```
