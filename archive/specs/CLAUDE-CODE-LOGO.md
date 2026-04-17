# Logo Einbau — Das Portal

## Kontext
Das Logo (`public/logo.png`, 363KB) ist ein vollformatiges Canva-Design: goldener Torbogen auf **schwarzem Hintergrund** mit Text "DAS PORTAL" und Subtitle. Es kann NICHT freigestellt werden.

## ⚠️ KORREKTUR: Navbar OHNE Logo
Das Logo sieht als kleines Icon in der Navbar schlecht aus (schwarzer Kasten, Text unlesbar). **Navbar bleibt Text-only!**

---

## Aufgaben

### 1. Navbar — NUR Text, KEIN Logo
**Datei:** `components/Navbar.tsx`

- **Kein `<Image>`-Tag in der Navbar** — nur der Text-Link "Das Portal"
- Falls ein Logo-Image aktuell eingebaut ist → entfernen und zurück auf reinen Text
- Styling wie original: `font-serif font-bold text-xl`

### 2. Landing Page Hero — Logo als Blickfang
**Datei:** `app/page.tsx`

- Im Hero-Bereich das Logo **über** der Headline platzieren
- Größe: ca. **120–160px** Höhe, zentriert
- `next/image` mit `priority` (LCP-Image)
- `src="/logo.png"`, `alt="Das Portal"`
- `quality={85}`
- Das schwarze Hintergrund-Design passt hier okay weil der Hero-Bereich genug Platz hat

### 3. Favicon & Metadata
**Datei:** `app/layout.tsx` + `public/`

- Kopiere `logo.png` als `public/favicon.png`
- In `app/layout.tsx` das Favicon auf `/favicon.png` setzen (oder `icon` in metadata)
- OG-Image: Setze `public/logo.png` als `openGraph.images` in der Metadata

### 4. Performance
- `priority` auf dem Hero-Image (LCP)
- `quality={85}` auf dem Hero-Image

## Wichtig
- **Navbar: KEIN Logo, nur Text** — das ist die explizite Korrektur
- Keine sonstigen Änderungen an Layout oder Styling
- Nach dem Einbau `npm run build` ausführen
