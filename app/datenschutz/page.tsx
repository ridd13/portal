export default function DatenschutzPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
      <h1 className="text-3xl font-semibold text-text-primary">Datenschutz</h1>
      <p className="mt-3 text-sm text-text-secondary">
        Diese Vorlage ist eine technische Basis und ersetzt keine juristische
        Beratung. Vor Produktion bitte rechtlich prüfen.
      </p>

      <section className="mt-6 space-y-5 text-sm leading-relaxed text-text-secondary">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Verantwortliche Stelle
          </h2>
          <p>
            Portal GmbH, Musterstrasse 1, 20354 Hamburg, kontakt@deine-domain.de
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Verarbeitete Daten
          </h2>
          <p>
            Beim Besuch der Seite können technische Zugriffsdaten (z. B.
            IP-Adresse, Browser, Zeitstempel) verarbeitet werden. Bei
            Registrierung verarbeiten wir E-Mail-Adresse und Auth-Daten über
            Supabase.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary">Zwecke</h2>
          <p>
            Bereitstellung der Plattform, Sicherheit, Nutzerverwaltung und
            Kommunikation zu Buchungen/Events.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Dienstleister
          </h2>
          <p>
            Hosting via Vercel, Datenbank/Auth via Supabase. Bitte nenne hier
            final alle eingesetzten Drittanbieter inkl. Rechtsgrundlage.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary">Rechte</h2>
          <p>
            Betroffene haben Rechte auf Auskunft, Berichtigung, Löschung,
            Einschränkung, Datenübertragbarkeit und Widerspruch.
          </p>
        </div>
      </section>
    </article>
  );
}
