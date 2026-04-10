import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { formatEventDate } from "@/lib/event-utils";
import { RegistrationActions } from "@/components/RegistrationActions";

type Registration = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: "confirmed" | "waitlisted" | "cancelled" | "declined";
  created_at: string;
};

type EventWithRegs = {
  id: string;
  title: string;
  start_at: string;
  registrations: Registration[];
};

export default async function AnmeldungenPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)!.value;
  const { user } = await getUserFromAccessToken(accessToken);
  const supabase = getSupabaseAdminClient();

  // Find host
  const { data: host } = await supabase
    .from("hosts")
    .select("id")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!host) {
    return (
      <div className="rounded-2xl border border-border bg-bg-secondary p-6 text-center">
        <p className="text-text-primary">Du hast noch kein Raumhalter:innen-Profil.</p>
        <p className="mt-1 text-sm text-text-secondary">
          Beanspruche zuerst dein Profil, um Anmeldungen verwalten zu können.
        </p>
      </div>
    );
  }

  // Load host's events with registration counts
  const { data: eventsRaw } = await supabase
    .from("events")
    .select("id, title, start_at")
    .eq("host_id", host.id)
    .order("start_at", { ascending: false });

  const events = (eventsRaw || []) as { id: string; title: string; start_at: string }[];

  // Selected event
  const selectedEventId = params.event || events[0]?.id;
  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Load registrations for selected event
  let registrations: Registration[] = [];
  if (selectedEventId) {
    const { data: regsRaw } = await supabase
      .from("event_registrations")
      .select("id, first_name, last_name, email, phone, message, status, created_at")
      .eq("event_id", selectedEventId)
      .order("created_at", { ascending: true });
    registrations = (regsRaw || []) as Registration[];
  }

  const confirmed = registrations.filter((r) => r.status === "confirmed").length;
  const waitlisted = registrations.filter((r) => r.status === "waitlisted").length;
  const cancelled = registrations.filter((r) => r.status === "cancelled" || r.status === "declined").length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-normal text-text-primary">Anmeldungen</h2>

      {events.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-secondary p-6 text-center">
          <p className="text-text-secondary">Noch keine Events vorhanden.</p>
        </div>
      ) : (
        <>
          {/* Event Selector */}
          <div>
            <label htmlFor="event-select" className="mb-1 block text-sm text-text-muted">
              Event auswählen
            </label>
            <form>
              <select
                id="event-select"
                name="event"
                defaultValue={selectedEventId}
                className="w-full max-w-lg rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("event", e.target.value);
                  window.location.href = url.toString();
                }}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} — {formatEventDate(ev.start_at)}
                  </option>
                ))}
              </select>
            </form>
          </div>

          {/* Stats */}
          {selectedEvent ? (
            <div className="flex flex-wrap gap-4">
              <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
                <p className="text-xs text-text-muted">Bestätigt</p>
                <p className="text-2xl font-bold text-accent-sage">{confirmed}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
                <p className="text-xs text-text-muted">Warteliste</p>
                <p className="text-2xl font-bold text-accent-primary">{waitlisted}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
                <p className="text-xs text-text-muted">Storniert</p>
                <p className="text-2xl font-bold text-text-muted">{cancelled}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-card px-4 py-3">
                <p className="text-xs text-text-muted">Gesamt</p>
                <p className="text-2xl font-bold text-text-primary">{registrations.length}</p>
              </div>
            </div>
          ) : null}

          {/* Registrations Table */}
          {registrations.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-bg-secondary">
                    <th className="px-4 py-3 font-medium text-text-muted">Name</th>
                    <th className="px-4 py-3 font-medium text-text-muted">E-Mail</th>
                    <th className="hidden px-4 py-3 font-medium text-text-muted sm:table-cell">Telefon</th>
                    <th className="hidden px-4 py-3 font-medium text-text-muted md:table-cell">Nachricht</th>
                    <th className="px-4 py-3 font-medium text-text-muted">Status</th>
                    <th className="px-4 py-3 font-medium text-text-muted">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="px-4 py-3 text-text-primary">
                        {reg.first_name} {reg.last_name}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{reg.email}</td>
                      <td className="hidden px-4 py-3 text-text-secondary sm:table-cell">{reg.phone || "—"}</td>
                      <td className="hidden max-w-[200px] truncate px-4 py-3 text-text-secondary md:table-cell">
                        {reg.message || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="px-4 py-3">
                        <RegistrationActions registrationId={reg.id} currentStatus={reg.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedEvent ? (
            <div className="rounded-2xl border border-border bg-bg-secondary p-6 text-center">
              <p className="text-text-secondary">Noch keine Anmeldungen für dieses Event.</p>
            </div>
          ) : null}

          {/* CSV Export */}
          {registrations.length > 0 ? (
            <ExportButton registrations={registrations} eventTitle={selectedEvent?.title || "export"} />
          ) : null}
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-accent-sage/15 text-accent-sage",
    waitlisted: "bg-accent-primary/15 text-accent-primary",
    cancelled: "bg-bg-secondary text-text-muted",
    declined: "bg-bg-secondary text-text-muted",
  };
  const labels: Record<string, string> = {
    confirmed: "Bestätigt",
    waitlisted: "Warteliste",
    cancelled: "Storniert",
    declined: "Abgelehnt",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-bg-secondary text-text-muted"}`}>
      {labels[status] || status}
    </span>
  );
}

function ExportButton({ registrations, eventTitle }: { registrations: Registration[]; eventTitle: string }) {
  const csvContent = [
    ["Vorname", "Nachname", "E-Mail", "Telefon", "Nachricht", "Status", "Datum"].join(","),
    ...registrations.map((r) =>
      [
        r.first_name,
        r.last_name,
        r.email,
        r.phone || "",
        `"${(r.message || "").replace(/"/g, '""')}"`,
        r.status,
        new Date(r.created_at).toLocaleDateString("de-DE"),
      ].join(",")
    ),
  ].join("\n");

  const href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;

  return (
    <a
      href={href}
      download={`anmeldungen-${eventTitle.toLowerCase().replace(/\s+/g, "-")}.csv`}
      className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary"
    >
      CSV exportieren
    </a>
  );
}
