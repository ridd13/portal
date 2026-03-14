# Font-Wechsel — Das Portal

## Neue Fonts
- **Headings (h1–h3):** Cinzel (Google Font) — wie im Logo verwendet
- **Body:** DM Sans (Google Font) — clean, geometrisch, gut lesbar
- **Akzente (Taglines, Subtitles):** DM Sans Italic in leichterer Gewichtung — kein dritter Font nötig

Beide sind Google Fonts — kostenlos, keine Lizenzprobleme.
Kein Handschrift-Font auf der Website — das Logo nutzt "Gravity 1" (Canva-exklusiv), aber der passt nicht als Web-Font. Kann später für Testimonials/Zitate ergänzt werden.

## Aufgaben

### 1. Google Fonts laden
**Datei:** `app/layout.tsx`

Next.js hat built-in Google Font Optimierung über `next/font/google`:

```tsx
import { Cinzel, DM_Sans } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
```

Auf dem `<body>` Tag die CSS-Variablen setzen:
```tsx
<body className={`${cinzel.variable} ${dmSans.variable}`}>
```

⚠️ Falls dort bereits andere `next/font` Imports sind (z.B. Geist, Inter) → ersetzen.

### 2. globals.css anpassen
**Datei:** `app/globals.css`

Die `@theme inline` Font-Definitionen nutzen jetzt die CSS-Variablen von next/font:

```css
--font-serif: var(--font-serif), "Cinzel", Georgia, serif;
--font-sans: var(--font-sans), "DM Sans", system-ui, sans-serif;
```

Der `body` Selektor und `h1, h2, h3` Selektor bleiben wie sie sind — die referenzieren schon `var(--font-serif)` und `var(--font-sans)`.

### 3. Prüfpunkte
- Alle Headings (h1–h3) sollten in Cinzel rendern
- Body-Text, Buttons, Inputs sollten in DM Sans rendern
- Navbar-Text "Das Portal" soll in Cinzel sein (font-serif)
- WaitlistForm Inputs und Labels in DM Sans

### 4. Navbar Logo-Fix
**Datei:** `components/Navbar.tsx`

Falls aktuell ein `<Image>` Logo in der Navbar ist → **entfernen**.
Navbar-Logo ist nur Text: "Das Portal" als Link mit `font-serif` (Cinzel).
Kein Bild-Logo in der Navbar!

---

## Nach der Umsetzung
- `npm run build` — muss kompilieren
- Visuell prüfen ob Cinzel auf Headings und DM Sans auf Body korrekt laden
- Lighthouse Check: Fonts sollten über next/font automatisch optimiert sein (kein Layout Shift)
