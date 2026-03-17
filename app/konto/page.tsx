import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { EventCard } from "@/components/EventCard";
import { ProfileEditor } from "@/components/ProfileEditor";
import type { Event, Host } from "@/lib/types";

export default async function KontoPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    redirect("/auth?mode=login&next=/konto");
  }

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) {
    redirect("/auth?mode=login&next=/konto");
  }

  const supabase = getSupabaseAdminClient();

  // Check if user owns a host profile
  const { data: host } = await supabase
    .from("hosts")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  const typedHost = host as Host | null;

  // Load events for owned host
  let events: Event[] = [];
  if (typedHost) {
    const { data: eventsData } = await supabase
      .from("events")
      .select("*, hosts(name, slug)")
      .eq("host_id", typedHost.id)
      .eq("is_public", true)
      .eq("status", "published")
      .order("start_at", { ascending: true })
      .limit(12);
    // Dedup: same title + start_at → keep newest by created_at
    const rawEvents = (eventsData || []) as Event[];
    const seen = new Map<string, Event>();
    for (const event of rawEvents) {
      const key = `${event.title}::${event.start_at}`;
      const existing = seen.get(key);
      if (!existing || (event.created_at && existing.created_at && event.created_at > existing.created_at)) {
        seen.set(key, event);
      }
    }
    events = Array.from(seen.values());
  }

  // Check for pending claims
  const { data: pendingClaims } = await supabase
    .from("claim_requests")
    .select("id, status, created_at, host_id")
    .eq("user_id", user.id)
    .eq("status", "pending");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Account Info */}
      <section className="rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
        <h1 className="font-serif text-3xl font-semibold text-text-primary">Mein Konto</h1>

        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-text-muted">E-Mail</dt>
            <dd className="text-text-primary">{user.email || "nicht verfügbar"}</dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/api/auth/logout"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-secondary"
          >
            Abmelden
          </Link>
        </div>
      </section>

      {/* Pending Claims */}
      {pendingClaims && pendingClaims.length > 0 ? (
        <section className="rounded-2xl border border-border bg-bg-secondary p-5">
          <h2 className="text-lg font-normal text-text-primary">Offene Profil-Anfragen</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Deine Anfrage wird geprüft. Wir melden uns in Kürze bei dir.
          </p>
        </section>
      ) : null}

      {/* Host Profile Editor */}
      {typedHost ? (
        <section className="rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
          <h2 className="font-serif text-2xl font-normal text-text-primary">
            Mein Anbieter:in-Profil
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Bearbeite dein öffentliches Profil auf Das Portal.
          </p>
          <div className="mt-6">
            <ProfileEditor host={typedHost} />
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-border bg-bg-secondary p-5">
          <h2 className="text-lg font-normal text-text-primary">Anbieter:in-Profil</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Du hast noch kein Anbieter:innen-Profil. Wenn du auf Das Portal als
            Anbieter:in gelistet bist, kannst du dein Profil auf deiner Profilseite
            beanspruchen.
          </p>
          <Link
            href="/events"
            className="mt-3 inline-block rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-primary"
          >
            Events durchsuchen
          </Link>
        </section>
      )}

      {/* Events */}
      {typedHost && events.length > 0 ? (
        <section>
          <h2 className="mb-4 text-2xl font-normal text-text-primary">Meine Events</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
