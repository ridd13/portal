import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-6 text-sm text-text-secondary sm:px-6 lg:px-8">
        <Link href="/impressum" className="transition hover:text-text-primary">
          Impressum
        </Link>
        <Link href="/datenschutz" className="transition hover:text-text-primary">
          Datenschutz
        </Link>
        <Link href="/kontakt" className="transition hover:text-text-primary">
          Kontakt
        </Link>
      </div>
    </footer>
  );
}
