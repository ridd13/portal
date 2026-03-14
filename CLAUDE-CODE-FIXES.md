# Portal MVP – Fix-Prompt für Claude Code

Bitte arbeite alle folgenden Punkte ab. Teste nach jedem Abschnitt mit `npm run build` dass nichts kaputt ist. Committe nach jedem Abschnitt.

---

## 1. Shared siteUrl Utility (Deduplizierung)

Erstelle `lib/site-url.ts`:

```ts
export const getSiteUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "https://example.com";
};
```

Dann ersetze die duplizierte `siteUrl`-Logik in diesen Dateien durch `import { getSiteUrl } from "@/lib/site-url"`:
- `app/layout.tsx`
- `app/sitemap.ts`
- `app/robots.ts`

---

## 2. generateMetadata für /events/[slug]

In `app/events/[slug]/page.tsx`:

Extrahiere die Supabase-Query in eine wiederverwendbare Funktion `getEvent(slug)`, die sowohl von `generateMetadata` als auch der Page-Komponente genutzt wird. **Wichtig:** Füge `.eq("status", "published")` zur Query hinzu – das fehlt aktuell!

```ts
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getCityFromAddress } from "@/lib/event-utils";

async function getEvent(slug: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, hosts(name, slug, description, website_url, social_links)")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "published")  // <-- DAS FEHLTE!
    .maybeSingle();
  if (error || !data) return null;
  return data as EventWithHost;
}

export async function generateMetadata({ params }: EventDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event nicht gefunden" };

  const siteUrl = getSiteUrl();
  const city = getCityFromAddress(event.address);
  const hostPreview = getHostPreview({ ...event, hosts: event.hosts });

  const description = event.description
    ? event.description.slice(0, 155).replace(/\n/g, " ") + "…"
    : `${event.title} – ${formatEventDate(event.start_at)}${city ? ` in ${city}` : ""}`;

  return {
    title: [event.title, city].filter(Boolean).join(" in "),
    description,
    openGraph: {
      type: "article",
      locale: "de_DE",
      url: `${siteUrl}/events/${slug}`,
      title: event.title,
      description,
      ...(event.cover_image_url ? { images: [{ url: event.cover_image_url, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: event.cover_image_url ? "summary_large_image" : "summary",
      title: event.title,
      description,
      ...(event.cover_image_url ? { images: [event.cover_image_url] } : {}),
    },
    alternates: { canonical: `/events/${slug}` },
  };
}
```

Dann nutze `getEvent(slug)` auch in der Page-Komponente statt der inline Query. Wenn `getEvent` null zurückgibt → `notFound()`.

---

## 3. generateMetadata für /hosts/[slug]

Gleiches Muster für `app/hosts/[slug]/page.tsx`:

```ts
export async function generateMetadata({ params }: HostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabaseServerClient();
  const { data: host } = await supabase
    .from("hosts")
    .select("name, slug, description")
    .eq("slug", slug)
    .maybeSingle();

  if (!host) return { title: "Host nicht gefunden" };

  const siteUrl = getSiteUrl();
  const description = host.description?.slice(0, 155) || `Events von ${host.name}`;

  return {
    title: host.name,
    description,
    openGraph: {
      type: "profile",
      locale: "de_DE",
      url: `${siteUrl}/hosts/${slug}`,
      title: host.name,
      description,
    },
    alternates: { canonical: `/hosts/${slug}` },
  };
}
```

---

## 4. Schema.org Event Structured Data

In `app/events/[slug]/page.tsx`, füge im Return der Page-Komponente VOR dem `<article>` Tag folgendes ein:

```tsx
const siteUrl = getSiteUrl();
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: event.title,
  description: event.description || undefined,
  startDate: event.start_at,
  endDate: event.end_at || undefined,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  url: `${siteUrl}/events/${event.slug}`,
  image: event.cover_image_url || undefined,
  location: (event.location_name || event.address) ? {
    "@type": "Place",
    name: event.location_name || undefined,
    address: event.address || undefined,
  } : undefined,
  organizer: hostPreview ? {
    "@type": "Organization",
    name: hostPreview.name,
    url: hostPreview.slug ? `${siteUrl}/hosts/${hostPreview.slug}` : undefined,
  } : undefined,
  offers: event.price_model ? {
    "@type": "Offer",
    price: event.price_model === "kostenlos" ? "0" : undefined,
    priceCurrency: "EUR",
    url: event.ticket_link || `${siteUrl}/events/${event.slug}`,
    availability: "https://schema.org/InStock",
  } : undefined,
};

return (
  <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <article>...</article>
  </>
);
```

---

## 5. ICS-Kalender-Download

Erstelle `lib/ics.ts`:

```ts
export function generateICS(event: {
  title: string;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  location_name?: string | null;
  address?: string | null;
  ticket_link?: string | null;
}): string {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const dtStart = fmt(event.start_at);
  const dtEnd = event.end_at
    ? fmt(event.end_at)
    : fmt(new Date(new Date(event.start_at).getTime() + 2 * 3600000).toISOString());

  const location = [event.location_name, event.address].filter(Boolean).join(", ");
  const desc = [
    event.description?.slice(0, 500),
    event.ticket_link ? `Anmeldung: ${event.ticket_link}` : null,
  ].filter(Boolean).join("\\n\\n");

  const uid = `${dtStart}-${event.title.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}@portal`;

  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Portal//Events//DE",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
    `UID:${uid}`, `DTSTART:${dtStart}`, `DTEND:${dtEnd}`,
    `SUMMARY:${event.title}`,
    location ? `LOCATION:${location}` : "",
    desc ? `DESCRIPTION:${desc}` : "",
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}
```

Erstelle `components/CalendarDownloadButton.tsx`:

```tsx
"use client";

interface CalendarDownloadButtonProps {
  icsContent: string;
  filename: string;
}

export function CalendarDownloadButton({ icsContent, filename }: CalendarDownloadButtonProps) {
  const handleDownload = () => {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary"
    >
      Zum Kalender hinzufügen
    </button>
  );
}
```

In der Event-Detailseite: importiere `generateICS` und `CalendarDownloadButton`. Generiere den ICS-Content serverseitig, übergib ihn als Prop an den Button, und platziere den Button neben dem "Zur Anmeldung" Link.

---

## 6. Social Links Komponente

Erstelle `components/SocialLinks.tsx`:

```tsx
import Link from "next/link";

interface SocialLinksProps {
  links: Record<string, string> | null;
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  telegram: "Telegram",
  website: "Website",
  linkedin: "LinkedIn",
  twitter: "X/Twitter",
};

export function SocialLinks({ links }: SocialLinksProps) {
  if (!links || Object.keys(links).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(links).map(([platform, url]) => (
        <a
          key={platform}
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full bg-bg-secondary px-3 py-1 text-xs font-medium text-text-secondary transition hover:bg-border hover:text-text-primary"
        >
          {PLATFORM_LABELS[platform.toLowerCase()] || platform}
        </a>
      ))}
    </div>
  );
}
```

Nutze diese Komponente in der Event-Detailseite (Host-Sektion) und auf der Host-Profilseite. Die `social_links` werden bereits aus Supabase geladen, aber nie angezeigt – das behebst du jetzt.

---

## 7. Hardcoded Farben durch Design-Tokens ersetzen

Füge in `globals.css` im `@theme inline` Block folgende Token hinzu:

```css
--color-error-bg: #f7e8e2;
--color-error-border: #e4b6a8;
--color-error-text: #7a3f2c;
--color-success-bg: #edf5e6;
--color-success-border: #bfd1b0;
--color-success-text: #4b6841;
--color-tag-bg: #efe6da;
```

Dann suche und ersetze in ALLEN Dateien:
- `bg-[#f7e8e2]` → `bg-error-bg`
- `border-[#e4b6a8]` → `border-error-border`
- `text-[#7a3f2c]` → `text-error-text`
- `bg-[#edf5e6]` → `bg-success-bg`
- `border-[#bfd1b0]` → `border-success-border`
- `text-[#4b6841]` → `text-success-text`
- `bg-[#efe6da]` → `bg-tag-bg`

Betrifft: `error.tsx`, `page.tsx` (events/[slug]), `page.tsx` (hosts/[slug]), `EventList.tsx`, `AuthForm.tsx`, `EventCard.tsx`.

---

## 8. Stadt-Dropdown mit echten Werten

In `app/page.tsx`: Lade neben den Tags auch die existierenden Städte:

```ts
const { data: allEventsForCities } = await supabase
  .from("events")
  .select("address")
  .eq("is_public", true)
  .eq("status", "published")
  .gte("start_at", new Date().toISOString());

const cities = [
  ...new Set(
    (allEventsForCities || [])
      .map((e: { address: string | null }) => getCityFromAddress(e.address))
      .filter(Boolean)
  ),
].sort((a, b) => a!.localeCompare(b!, "de")) as string[];
```

Übergib `cities` an `EventFilters`. In `EventFilters.tsx` ersetze das Stadt-Input durch ein Select (wie beim Tag-Dropdown):

```tsx
<select
  value={city}
  onChange={(e) => setCity(e.target.value)}
  className="rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-sage"
>
  <option value="">Alle Städte</option>
  {cities.map((c) => (
    <option key={c} value={c}>{c}</option>
  ))}
</select>
```

---

## 9. AuthNav Refactoring

In `components/AuthNav.tsx`: Der "Nicht eingeloggt"-JSX-Block existiert zweimal identisch (einmal wenn kein Cookie, einmal wenn User ungültig). Extrahiere das in eine Variable:

```tsx
const guestNav = (
  <>
    <Link href="/auth?mode=login" className="rounded-full px-3 py-2 transition hover:bg-bg-secondary hover:text-text-primary">
      Anmelden
    </Link>
    <Link href="/auth?mode=signup" className="rounded-full border border-accent-primary px-4 py-2 text-accent-primary transition hover:bg-accent-primary hover:text-white">
      Registrieren
    </Link>
  </>
);

export async function AuthNav() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) return guestNav;

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) return guestNav;

  return (
    <>
      <Link href="/konto" className="rounded-full px-3 py-2 transition hover:bg-bg-secondary hover:text-text-primary">
        Konto
      </Link>
      <LogoutButton />
    </>
  );
}
```

---

## 10. Sentry Wrapper in next.config.ts

Die Sentry-Integration braucht den Config-Wrapper um zu funktionieren. Prüfe ob `sentry.client.config.ts`, `sentry.server.config.ts` und `sentry.edge.config.ts` existieren. Wenn ja, update `next.config.ts`:

```ts
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
});
```

Falls die Sentry Config-Files NICHT existieren, erstelle sie als leere Dateien oder entferne `@sentry/nextjs` komplett aus den dependencies.

---

## 11. Finale Checks

Nach allen Änderungen:

1. `npm run build` – muss fehlerfrei durchlaufen
2. `npm run lint` – Warnings fixen wenn möglich
3. Prüfe dass keine `.env`-Werte oder Secrets im Code stehen
4. Prüfe dass alle neuen Imports korrekt sind

---

## Zusammenfassung der neuen Dateien

- `lib/site-url.ts` (shared utility)
- `lib/ics.ts` (ICS-Generator)
- `components/CalendarDownloadButton.tsx` (Client Component)
- `components/SocialLinks.tsx` (Server Component)

## Geänderte Dateien

- `app/layout.tsx` (siteUrl import)
- `app/sitemap.ts` (siteUrl import)
- `app/robots.ts` (siteUrl import)
- `app/events/[slug]/page.tsx` (generateMetadata, Schema.org, Status-Check, ICS, Social Links)
- `app/hosts/[slug]/page.tsx` (generateMetadata, Social Links)
- `app/page.tsx` (cities laden)
- `app/globals.css` (neue Token)
- `components/EventFilters.tsx` (Stadt-Dropdown)
- `components/AuthNav.tsx` (Refactoring)
- `components/EventCard.tsx` (hardcoded Farben)
- `components/AuthForm.tsx` (hardcoded Farben)
- `components/EventList.tsx` (hardcoded Farben)
- `app/error.tsx` (hardcoded Farben)
- `next.config.ts` (Sentry Wrapper)
