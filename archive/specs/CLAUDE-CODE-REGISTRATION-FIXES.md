# Fix: Registration Redesign — 3 kritische Bugs

> Die Grundstruktur (2 Felder, Form unter Beschreibung) wurde umgesetzt, aber es gibt drei Bugs die sofort gefixt werden müssen.

## Bug 1: "Datenschutzerklärung" kaputt (Encoding)

**Problem:** Im Datenschutz-Hinweis unter dem Button wird `Datenschutzerkl\u00e4rung` gerendert statt "Datenschutzerklärung". Unicode-Escape wird nicht aufgelöst.

**Fix:** In der neuen Registration-Component (vermutlich `EventRegistration.tsx` oder weiterhin `EventRegistrationForm.tsx`) den Datenschutz-Link suchen. Der Text muss als normaler UTF-8 String geschrieben sein, nicht als escaped Unicode.

Suche nach dem Datenschutz-Hinweis und stelle sicher, dass dort steht:
```tsx
Datenschutzerklärung
```
Nicht:
```tsx
Datenschutzerkl\u00e4rung
```

Prüfe auch ob das ä im JSX als HTML-Entity (`&auml;`) oder als literaler Buchstabe steht. Beides sollte funktionieren, aber `\u00e4` in einem JSX-String-Literal wird nicht immer korrekt gerendert, je nach Kontext.

## Bug 2: Lumaya darf nicht als Anbieter auftauchen

**Problem:** "Lumaya Conscious Events" wird als Host/Anbieter auf der Plattform angezeigt. Lumaya ist ein Wettbewerber — deren Events werden zwar importiert (weil sie in Hamburg stattfinden), aber Lumaya selbst soll nicht als Anbieter auf Das Portal gelistet sein.

**Fix (2 Ebenen):**

### a) Host verstecken
In der `hosts`-Tabelle den Lumaya-Eintrag finden und `is_public = false` setzen (oder ein neues Flag `is_hidden`). So wird das Host-Profil nicht auf /hosts gelistet.

```sql
-- Erst schauen was da ist:
SELECT id, name, slug FROM hosts WHERE name ILIKE '%lumaya%';

-- Dann verstecken:
UPDATE hosts SET is_public = false WHERE name ILIKE '%lumaya%';
```

Falls `is_public` auf hosts nicht existiert, stattdessen:
```sql
ALTER TABLE hosts ADD COLUMN is_public boolean DEFAULT true;
UPDATE hosts SET is_public = false WHERE name ILIKE '%lumaya%';
```

### b) Events behalten, Host-Link entfernen
Auf der Event-Detailseite: Wenn der Host `is_public = false` ist, den Anbieter-Block NICHT anzeigen (keinen Link zum Host-Profil, keinen Namen). Das Event steht dann ohne expliziten Anbieter da.

In `app/events/[slug]/page.tsx` im Anbieter-Block:
```tsx
{/* Anbieter — nur anzeigen wenn Host öffentlich ist */}
{hostPreview && hostPreview.is_public !== false ? (
  // ... Anbieter-Block wie bisher
) : null}
```

Dafür muss `is_public` in der Supabase-Query mit-selected werden:
```tsx
.select("*, hosts(name, slug, description, website_url, social_links, telegram_username, email, is_public), ...")
```

Und `HostPreview` in `lib/types.ts` erweitern:
```typescript
interface HostPreview {
  name: string;
  slug: string | null;
  is_public?: boolean;
}
```

### c) Langfristig: Import-Pipeline filtern
In der n8n Event-Import Pipeline oder in `/api/events/import`: Wenn `host_name` oder `sender_name` "Lumaya" enthält, den Host NICHT neu anlegen. Events können trotzdem importiert werden, aber ohne Host-Zuordnung. Das ist ein separater Task für später.

## Bug 3: Auth-Flow fehlt — Login-Button einbauen

**Problem:** Der Spec sagt Auth-First (Option A), aber es wurde nur Phase 1 (vereinfachtes Gast-Form) umgesetzt. Der Login-Button fehlt.

**Kontext:** Auth ist bereits reaktiviert (Commit `4c54d26: feat: auth reactivated + host dashboard`). Supabase Auth mit Magic Link sollte funktionieren.

**Fix:** In der Registration-Component über dem Gast-Formular einen Login-Block einbauen:

```tsx
{/* Auth-First: Login-Button */}
<div className="space-y-3 mb-4">
  <button
    type="button"
    onClick={() => {
      // Supabase Magic Link versenden
      // Nach Login: automatisch für Event registrieren
      setShowLogin(true);
    }}
    className="w-full rounded-xl border-2 border-accent-primary bg-transparent px-6 py-3 text-base font-semibold text-accent-primary transition hover:bg-accent-primary hover:text-white"
  >
    Mit E-Mail einloggen
  </button>

  <div className="flex items-center gap-3">
    <div className="h-px flex-1 bg-border" />
    <span className="text-xs text-text-muted">oder als Gast</span>
    <div className="h-px flex-1 bg-border" />
  </div>
</div>

{/* Gast-Form (bestehend) */}
<form action={formAction} className="space-y-3">
  ...
</form>
```

### Login-Flow im Detail

Wenn "Mit E-Mail einloggen" geklickt wird:

1. **E-Mail-Input anzeigen** (inline, kein Redirect):
```tsx
{showLogin && (
  <div className="space-y-3 mb-4 p-4 rounded-xl bg-bg-secondary">
    <input
      type="email"
      value={loginEmail}
      onChange={(e) => setLoginEmail(e.target.value)}
      placeholder="Deine E-Mail"
      className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 ..."
    />
    <button
      type="button"
      onClick={handleMagicLink}
      disabled={isSendingLink}
      className="w-full rounded-xl bg-accent-primary px-6 py-3 text-white font-semibold ..."
    >
      {isSendingLink ? "Link wird gesendet..." : "Magic Link senden"}
    </button>
    <p className="text-xs text-text-muted text-center">
      Du bekommst einen Login-Link per E-Mail.
    </p>
  </div>
)}
```

2. **Magic Link senden** via Supabase:
```tsx
const handleMagicLink = async () => {
  setIsSendingLink(true);
  const { error } = await supabase.auth.signInWithOtp({
    email: loginEmail,
    options: {
      emailRedirectTo: `${window.location.origin}/events/${slug}#anmeldung`,
    },
  });
  if (error) {
    setLoginError("Fehler beim Senden. Bitte versuche es erneut.");
  } else {
    setLinkSent(true);
  }
  setIsSendingLink(false);
};
```

3. **Nach Login** (User kommt zurück via Magic Link):
   - Component prüft `supabase.auth.getUser()`
   - Wenn eingeloggt → Nur "Platz sichern" Button anzeigen (Name + E-Mail aus User-Profil)
   - One-Click-Registration, kein Formular

```tsx
// Am Anfang der Component:
const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}, []);

// Im Render:
{user ? (
  // Eingeloggt → One-Click
  <div className="space-y-3">
    <p className="text-sm text-text-secondary">
      Angemeldet als <strong>{user.email}</strong>
    </p>
    <form action={formAction}>
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="email" value={user.email || ""} />
      <input type="hidden" name="name" value={user.user_metadata?.name || user.email || ""} />
      <button type="submit" disabled={isPending} className="w-full rounded-xl bg-accent-primary ...">
        {isPending ? "Wird angemeldet..." : "Platz sichern"}
      </button>
    </form>
  </div>
) : (
  // Nicht eingeloggt → Login-Button + Gast-Form
  <>
    {/* Login-Block */}
    {/* Gast-Form */}
  </>
)}
```

**Wichtig:** Für den Supabase Client im Client-Component brauchst du `createBrowserClient` aus `@supabase/ssr` (nicht den Server-Client). Falls noch nicht vorhanden:
```typescript
// lib/supabase-browser.ts
import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## Reihenfolge

1. Bug 1 fixen (Encoding — 1 Zeile)
2. Bug 3 fixen (Auth-Flow einbauen)
3. Bug 2 fixen (Lumaya verstecken — DB + Query + Type)
4. `npm run build` → grün
5. Commit: `fix: registration auth-flow, encoding bug, hide competitor hosts`
6. Nach Commit: `mv CLAUDE-CODE-REGISTRATION-FIXES.md archive/specs/ && mv CLAUDE-CODE-REGISTRATION-REDESIGN.md archive/specs/`
