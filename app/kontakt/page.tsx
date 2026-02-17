export default function KontaktPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
      <h1 className="text-3xl font-semibold text-text-primary">Kontakt</h1>
      <p className="mt-3 text-text-secondary">
        Für Fragen zu Events, Kooperationen oder technischen Themen.
      </p>

      <section className="mt-6 space-y-3 text-sm text-text-secondary">
        <p>
          E-Mail: <a href="mailto:kontakt@deine-domain.de">kontakt@deine-domain.de</a>
        </p>
        <p>Telefon: +49 40 123456</p>
        <p>Adresse: Musterstrasse 1, 20354 Hamburg</p>
      </section>
    </article>
  );
}
