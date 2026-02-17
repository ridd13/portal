import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-border bg-bg-card p-8 text-center shadow-[0_8px_24px_rgba(44,36,24,0.07)]">
      <h1 className="text-3xl font-semibold text-text-primary">Nicht gefunden</h1>
      <p className="mt-2 text-text-secondary">
        Der angeforderte Inhalt existiert nicht oder ist nicht öffentlich.
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex rounded-full bg-accent-primary px-5 py-2.5 text-sm font-semibold text-white"
      >
        Zur Startseite
      </Link>
    </section>
  );
}
