import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von Das Portal – Informationen zur Verarbeitung personenbezogener Daten.",
  robots: { index: false, follow: false },
};

export default function DatenschutzPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
      <h1 className="font-serif text-3xl font-semibold text-text-primary">
        Datenschutzerklärung
      </h1>

      <section className="mt-6 space-y-6 text-sm leading-relaxed text-text-secondary">
        {/* 1. Verantwortlicher */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            1. Verantwortlicher
          </h2>
          <p>
            Lennert Bewernick
            <br />
            Lindenallee 10
            <br />
            23843 Rümpel
            <br />
            E-Mail: lennert.bewernick@gmail.com
          </p>
        </div>

        {/* 2. Warteliste */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            2. Erhobene Daten — Warteliste
          </h2>
          <p>
            Wenn du dich auf die Warteliste einträgst, erheben wir folgende
            Daten: E-Mail-Adresse, Name, Rolle (Besucher/Facilitator) und
            Stadt.
          </p>
          <p className="mt-2">
            <strong className="text-text-primary">Rechtsgrundlage:</strong>{" "}
            Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
          </p>
          <p className="mt-1">
            <strong className="text-text-primary">Speicherort:</strong>{" "}
            Supabase (Server: AWS eu-central-1, Frankfurt).
          </p>
          <p className="mt-1">
            <strong className="text-text-primary">Löschung:</strong> Auf
            Anfrage jederzeit per E-Mail möglich.
          </p>
        </div>

        {/* 3. Newsletter */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            3. Newsletter
          </h2>
          <p className="mt-1 font-medium text-text-primary">Welche Daten verarbeiten wir?</p>
          <p className="mt-1">
            Wenn du dich für unseren wöchentlichen Newsletter „Hamburg diese Woche" anmeldest,
            verarbeiten wir folgende Daten:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Deine E-Mail-Adresse</li>
            <li>Den Zeitpunkt deiner Anmeldung</li>
            <li>
              Deine IP-Adresse zum Zeitpunkt der Anmeldung (zur Beweisbarkeit der Einwilligung)
            </li>
            <li>
              Die Tatsache, ob du den Newsletter geöffnet und welche Links du geklickt hast
              (anonymisiertes Tracking durch unseren Versanddienstleister)
            </li>
          </ul>
          <p className="mt-3 font-medium text-text-primary">Rechtsgrundlage</p>
          <p className="mt-1">
            Die Verarbeitung erfolgt auf Grundlage deiner ausdrücklichen Einwilligung gemäß
            Art. 6 Abs. 1 lit. a DSGVO und §7 Abs. 2 Nr. 3 UWG.
          </p>
          <p className="mt-2">
            Wir nutzen das Double-Opt-In-Verfahren: Nach der Anmeldung erhältst du eine
            Bestätigungs-E-Mail. Erst nach Klick auf den Bestätigungslink wirst du in den
            Verteiler aufgenommen.
          </p>
          <p className="mt-3 font-medium text-text-primary">Zweck</p>
          <p className="mt-1">
            Versand eines wöchentlichen Newsletters mit kuratierten Hamburg-Events. Klick-Tracking
            dient der Verbesserung der inhaltlichen Kuratierung.
          </p>
          <p className="mt-3 font-medium text-text-primary">Empfänger / Auftragsverarbeiter</p>
          <p className="mt-1">
            Wir nutzen für den Versand den Dienstleister:
            <br />
            <strong className="text-text-primary">Mailerlite Limited</strong>
            <br />
            38 Mount Street Upper, Dublin D02 PR89, Ireland
            <br />
            <a
              href="https://www.mailerlite.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline"
            >
              Datenschutzerklärung Mailerlite
            </a>
          </p>
          <p className="mt-2">
            Mit Mailerlite haben wir einen Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO
            abgeschlossen. Die Daten werden auf Servern in der EU verarbeitet.
          </p>
          <p className="mt-3 font-medium text-text-primary">Speicherdauer</p>
          <p className="mt-1">
            Wir speichern deine Daten, solange du den Newsletter abonniert hast. Nach deiner
            Abmeldung werden deine Daten für 6 Monate in einer Sperrliste vorgehalten (zum Nachweis
            der Einwilligung und um versehentliche Wiederanmeldungen zu vermeiden) und danach
            vollständig gelöscht.
          </p>
          <p className="mt-3 font-medium text-text-primary">Widerrufsrecht</p>
          <p className="mt-1">
            Du kannst deine Einwilligung jederzeit widerrufen — entweder über den Abmelde-Link am
            Ende jeder Newsletter-Mail oder per E-Mail an{" "}
            <a href="mailto:hallo@das-portal.online" className="text-accent-primary underline">
              hallo@das-portal.online
            </a>
            . Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt vom Widerruf
            unberührt.
          </p>
        </div>

        {/* 4. Hosting */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            4. Hosting
          </h2>
          <p>
            Diese Website wird bei Vercel Inc., 440 N Barranca Ave #4133,
            Covina, CA 91723, USA gehostet. Vercel nutzt ein Edge Network (CDN)
            mit Servern auch in der EU.
          </p>
          <p className="mt-2">
            Vercel speichert automatisch: IP-Adresse, Browsertyp und
            Zeitstempel (Server-Logs).
          </p>
          <p className="mt-1">
            <strong className="text-text-primary">Rechtsgrundlage:</strong>{" "}
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
            Bereitstellung der Website).
          </p>
          <p className="mt-1">
            Datenschutzerklärung von Vercel:{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline"
            >
              vercel.com/legal/privacy-policy
            </a>
          </p>
        </div>

        {/* 5. Datenbank */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            5. Datenbank
          </h2>
          <p>
            Wir nutzen Supabase Inc. als Datenbankdienst. Die Projekt-Region
            ist EU (Frankfurt, eu-central-1). Gespeichert werden:
            Wartelisten-Daten, Event-Daten und Host-Daten.
          </p>
          <p className="mt-1">
            Datenschutzerklärung:{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline"
            >
              supabase.com/privacy
            </a>
          </p>
        </div>

        {/* 6. Standortdaten */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            6. Standortdaten
          </h2>
          <p>
            <strong className="text-text-primary">
              Browser-Geolocation:
            </strong>{" "}
            Wird nur nach expliziter Zustimmung des Nutzers abgefragt.
          </p>
          <p className="mt-2">
            <strong className="text-text-primary">
              Manuelle PLZ-Eingabe:
            </strong>{" "}
            Wird an Nominatim (OpenStreetMap) zur Geocodierung gesendet.
            Nominatim wird von der OpenStreetMap Foundation betrieben — keine
            Registrierung erforderlich, die IP-Adresse wird temporär geloggt.
          </p>
          <p className="mt-2">
            Der Standort wird ausschließlich im localStorage deines Browsers
            gespeichert, nicht auf unseren Servern.
          </p>
          <p className="mt-1">
            <strong className="text-text-primary">Rechtsgrundlage:</strong>{" "}
            Art. 6 Abs. 1 lit. a DSGVO (Einwilligung via Browser-Dialog).
          </p>
        </div>

        {/* 7. Karten */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            7. Karten
          </h2>
          <p>
            Zur Darstellung der Karte werden OpenStreetMap-Kacheln via Leaflet
            geladen (tile.openstreetmap.org). Dabei wird deine IP-Adresse an
            die Server der OpenStreetMap Foundation übermittelt.
          </p>
          <p className="mt-1">
            Datenschutz:{" "}
            <a
              href="https://wiki.osmfoundation.org/wiki/Privacy_Policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline"
            >
              osmfoundation.org/wiki/Privacy_Policy
            </a>
          </p>
        </div>

        {/* 8. Error Tracking */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            8. Error Tracking
          </h2>
          <p>
            Wir nutzen Sentry (Functional Software Inc.) zur Fehlererkennung.
            Erfasst werden: Fehlermeldungen, Stack Traces, Browser-Informationen
            und anonymisierte IP-Adressen.
          </p>
          <p className="mt-1">
            <strong className="text-text-primary">Rechtsgrundlage:</strong>{" "}
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an
            Fehlerbehebung).
          </p>
          <p className="mt-1">
            Datenschutz:{" "}
            <a
              href="https://sentry.io/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline"
            >
              sentry.io/privacy
            </a>
          </p>
        </div>

        {/* 9. Analyse & Performance */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            9. Analyse & Performance
          </h2>
          <p>
            Wir nutzen <strong className="text-text-primary">Vercel Analytics</strong> und{" "}
            <strong className="text-text-primary">Vercel Speed Insights</strong> zur Analyse
            der Seitennutzung und zur Messung von Performance-Metriken (Core Web Vitals).
          </p>
          <p className="mt-2">
            Beide Dienste arbeiten <strong className="text-text-primary">cookiefrei</strong> —
            es werden keine Cookies gesetzt und keine persistenten Nutzer-IDs angelegt. Erfasst
            werden anonymisierte Seitenaufrufe und technische Performance-Daten (Ladezeiten,
            Gerätekategorie).
          </p>
          <p className="mt-1">
            <strong className="text-text-primary">Rechtsgrundlage:</strong>{" "}
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Verbesserung der
            Website-Performance). Ein Cookie-Consent ist nicht erforderlich.
          </p>
          <p className="mt-1">
            Datenschutzerklärung Vercel:{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline"
            >
              vercel.com/legal/privacy-policy
            </a>
          </p>
        </div>

        {/* 10. Cookies & Local Storage */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            10. Cookies & Local Storage
          </h2>
          <p>
            Diese Website setzt keine Tracking-Cookies ein. Wir verwenden
            localStorage ausschließlich zur Speicherung deines Standorts (kannst
            du jederzeit in den Browser-Einstellungen löschen).
          </p>
          <p className="mt-2">
            Es werden kein Google Analytics, kein Facebook Pixel und keine
            Werbetracker eingesetzt.
          </p>
        </div>

        {/* 11. Automatische Event-Erfassung */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            11. Automatische Event-Erfassung
          </h2>
          <p>
            Events werden teilweise automatisiert aus öffentlichen
            Telegram-Gruppen erfasst. Dabei werden ausschließlich öffentlich
            geteilte Event-Informationen übernommen: Titel, Datum, Ort und
            Beschreibung.
          </p>
          <p className="mt-2">
            Der Name des Absenders wird als Anbieter-Profil auf Das Portal
            angelegt. Anbieter können jederzeit die Löschung ihres
            Profils und ihrer Events per Telegram an{" "}
            <a
              href="https://t.me/lbewernick"
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent-primary underline"
            >
              @lbewernick
            </a>{" "}
            oder per E-Mail an{" "}
            <a
              href="mailto:lennert.bewernick@gmail.com"
              className="text-accent-primary underline"
            >
              lennert.bewernick@gmail.com
            </a>{" "}
            beantragen.
          </p>
          <p className="mt-1">
            <strong className="text-text-primary">Rechtsgrundlage:</strong>{" "}
            Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
            Bereitstellung einer Event-Übersicht auf Basis öffentlich
            zugänglicher Informationen).
          </p>
        </div>

        {/* 12. Profil-Beanspruchung */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            12. Profil-Beanspruchung
          </h2>
          <p>
            Anbieter können ihr automatisch erstelltes Profil
            beanspruchen. Dafür wird die E-Mail-Adresse verarbeitet, die bei
            der Kontaktaufnahme angegeben wird.
          </p>
          <p className="mt-1">
            <strong className="text-text-primary">Rechtsgrundlage:</strong>{" "}
            Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
          </p>
          <p className="mt-2">
            Zukünftig ist eine Authentifizierung per Magic Link geplant. Die
            dafür erforderliche Datenverarbeitung wird zu gegebener Zeit hier
            ergänzt.
          </p>
        </div>

        {/* 13. Telegram */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            13. Telegram-Kanal
          </h2>
          <p>
            Auf der Website verlinken wir unseren Telegram-Kanal
            (t.me/dasgrosseportal). Beim Klick gelten die
            Datenschutzbestimmungen von Telegram. Wir erhalten keine
            personenbezogenen Daten von Telegram-Nutzern.
          </p>
        </div>

        {/* 14. Betroffenenrechte */}
        <div>
          <h2 className="font-serif text-lg font-normal text-text-primary">
            14. Deine Rechte
          </h2>
          <p>Du hast jederzeit das Recht auf:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Auskunft (Art. 15 DSGVO)</li>
            <li>Berichtigung (Art. 16 DSGVO)</li>
            <li>Löschung (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch (Art. 21 DSGVO)</li>
          </ul>
          <p className="mt-3">
            Zur Ausübung deiner Rechte wende dich an:{" "}
            <a
              href="mailto:lennert.bewernick@gmail.com"
              className="text-accent-primary underline"
            >
              lennert.bewernick@gmail.com
            </a>
          </p>
          <p className="mt-2">
            Du hast außerdem das Recht, dich bei der zuständigen
            Aufsichtsbehörde zu beschweren:
          </p>
          <p className="mt-1">
            Unabhängiges Landeszentrum für Datenschutz Schleswig-Holstein
            (ULD)
            <br />
            <a
              href="https://www.datenschutzzentrum.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline"
            >
              www.datenschutzzentrum.de
            </a>
          </p>
        </div>
      </section>
    </article>
  );
}
