export default function ImpressumPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
      <h1 className="text-3xl font-semibold text-text-primary">Impressum</h1>
      <p className="mt-3 text-sm text-text-secondary">
        Bitte ersetze die Platzhalter durch deine echten Unternehmensdaten, bevor
        du live gehst.
      </p>

      <section className="mt-6 space-y-4 text-sm leading-relaxed text-text-secondary">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Angaben gemäß § 5 TMG
          </h2>
          <p>
            Portal GmbH
            <br />
            Musterstrasse 1
            <br />
            20354 Hamburg
            <br />
            Deutschland
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary">Vertreten durch</h2>
          <p>Max Mustermann, Geschäftsführer</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary">Kontakt</h2>
          <p>
            E-Mail: kontakt@deine-domain.de
            <br />
            Telefon: +49 40 123456
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary">USt-IdNr.</h2>
          <p>DE123456789</p>
        </div>
      </section>
    </article>
  );
}
