export default function KontaktPage() {
  return (
    <article className="mx-auto max-w-3xl rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
      <h1 className="text-3xl font-semibold text-text-primary">Kontakt</h1>
      <p className="mt-3 text-text-secondary">
        Für Fragen zu Events, Kooperationen oder technischen Themen.
      </p>

      <section className="mt-6 space-y-3 text-sm text-text-secondary">
        <p>
          E-Mail:{" "}
          <a href="mailto:lennert.bewernick@gmail.com" className="text-accent-primary hover:underline">
            lennert.bewernick@gmail.com
          </a>
        </p>
        <p>Telefon: 0176 62348657</p>
        <p>
          Lennert Bewernick
          <br />
          Lindenallee 10
          <br />
          23843 Rümpel
        </p>
      </section>
    </article>
  );
}
