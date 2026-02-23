/**
 * Generate an ICS calendar file string for a single event.
 */
export function generateICS(event: {
  title: string;
  description?: string | null;
  start_at: string;
  end_at?: string | null;
  location_name?: string | null;
  address?: string | null;
  ticket_link?: string | null;
}): string {
  const formatDate = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const dtStart = formatDate(event.start_at);
  const dtEnd = event.end_at
    ? formatDate(event.end_at)
    : formatDate(
        new Date(
          new Date(event.start_at).getTime() + 2 * 60 * 60 * 1000
        ).toISOString()
      );

  const location = [event.location_name, event.address]
    .filter(Boolean)
    .join(", ");

  const description = [
    event.description?.slice(0, 500),
    event.ticket_link ? `Anmeldung: ${event.ticket_link}` : null,
  ]
    .filter(Boolean)
    .join("\\n\\n");

  const uid = `${dtStart}-${event.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .slice(0, 30)}@portal`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Portal//Events//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title}`,
    location ? `LOCATION:${location}` : "",
    description ? `DESCRIPTION:${description}` : "",
    `DTSTAMP:${formatDate(new Date().toISOString())}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
