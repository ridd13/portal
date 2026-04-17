# Claude Code Prompt — Portal V7 (Pre-Launch Fixes)

> Lies zuerst CLAUDE.md, dann dieses File. Führe `npm run build` nach jeder Task aus.

## Kontext

V6 wurde vollständig umgesetzt. Cowork hat bereits folgende Änderungen gemacht (NICHT überschreiben):
- `components/Navbar.tsx` — Desktop-Nav mit `hidden sm:flex`, Mobile via `<MobileNav />`
- `components/MobileNav.tsx` — NEU: Client Component mit Hamburger-Menü für Mobile
- `components/Footer.tsx` — Kontakt-Link entfernt
- `components/LocationInput.tsx` — "Mein Standort"-Button hinzugefügt
- `app/events/[slug]/page.tsx` — Host-Name und "Website besuchen" Link getrennt (block statt inline)
- `app/api/events/import/route.ts` — website_url wird nicht mehr aus ticket_link abgeleitet
- `app/hosts/[slug]/page.tsx` — Vergangene Events + Dedup (schon implementiert, NICHT anfassen)
- `app/konto/page.tsx` — Dedup-Logik (schon implementiert, NICHT anfassen)
- `app/favicon.ico` — umbenannt zu `.bak` (Vercel-Default entfernt)

Diese Dateien sind bereits geändert. Bitte NICHT anfassen, außer es gibt einen Build-Fehler.

---

## Task 1: Favicon bereinigen

Die Datei `app/favicon.ico.bak` (ehemals Vercel-Default) muss gelöscht werden:

```bash
rm app/favicon.ico.bak
```

Sicherstellen, dass in `app/layout.tsx` die Metadata korrekt auf das Portal-Logo zeigt:
```typescript
icons: {
  icon: "/favicon.png",
  apple: "/favicon.png",
},
```

Die `/public/favicon.png` enthält bereits das Portal-Logo. Prüfe ob es auch als `/public/logo.png` existiert (sollte es) und ob in layout.tsx ein `openGraph.images` gesetzt ist. Falls nicht:

```typescript
openGraph: {
  images: [{ url: "/logo.png", width: 512, height: 512, alt: "Das Portal Logo" }],
}
```

Das sorgt dafür, dass Telegram und Social-Media-Shares das Portal-Logo als Vorschaubild ziehen (für Seiten ohne eigenes og:image).

---

## ~~Task 2 + 3: BEREITS ERLEDIGT~~

Host-Profil Dedup + Vergangene Events + Konto-Seite Dedup — wurden bereits von Cowork implementiert. NICHT anfassen.

---

## Task 2: Vergangene Events über Datumsfilter auf Events-Seite findbar machen

**Datei:** `app/events/page.tsx`

Aktuell filtert die Events-Seite vergangene Events komplett raus. Wenn ein User aber im Datumsfilter ein **vergangenes "Von"-Datum** eingibt, sollen vergangene Events angezeigt werden.

**Umsetzung:**

- Wenn der User ein "Von"-Datum setzt das in der Vergangenheit liegt → `startFrom` auf dieses Datum setzen (statt `new Date().toISOString()`)
- Wenn der User KEIN "Von"-Datum setzt → weiterhin nur zukünftige Events (Default wie bisher)
- Das betrifft die Variable `startFrom` in der Query-Logik. Prüfe ob das bereits so funktioniert, und falls nicht, passe es an.

---

## Task 3: Build verifizieren

`npm run build` ausführen. Sicherstellen:
- Keine TypeScript-Fehler
- Navbar importiert MobileNav korrekt
- Alle Seiten bauen erfolgreich

---

## Task 4: Sitemap bereinigen

**Datei:** `app/sitemap.ts`

Die Sitemap enthält noch `/kontakt` (Zeile 25). Da die Kontakt-Seite nicht mehr verlinkt ist, entferne sie aus der Sitemap.

Außerdem: `/auth` sollte NICHT in der Sitemap sein (ist es vermutlich nicht, aber bitte prüfen). Auch `/konto` nicht.

---

## REGELN

- Alle UI-Texte auf Deutsch
- KEINE Referenzen zu JustClose — Das Portal ist ein eigenständiges Projekt
- "Anbieter:in" als Bezeichnung (nicht "Host", nicht "Facilitator")
- `next/image` für Bilder, `"use client"` nur wenn nötig
- Design-Tokens aus globals.css nutzen (keine hardcodierten Farben)
