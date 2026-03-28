import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-text-secondary sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/impressum" className="transition hover:text-text-primary">
            Impressum
          </Link>
          <Link href="/datenschutz" className="transition hover:text-text-primary">
            Datenschutz
          </Link>
          <a
            href="https://t.me/dasgrosseportal"
            target="_blank"
            rel="noreferrer noopener"
            className="transition hover:text-text-primary"
          >
            Telegram
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
          <span>Regionen:</span>
          <Link href="/hamburg/ganzheitliche-events" className="transition hover:text-text-primary">
            Hamburg – Ganzheitlich
          </Link>
          <Link href="/hamburg/spirituelle-events" className="transition hover:text-text-primary">
            Hamburg – Spirituell
          </Link>
          <Link href="/schleswig-holstein/ganzheitliche-events" className="transition hover:text-text-primary">
            Schleswig-Holstein – Ganzheitlich
          </Link>
        </div>
      </div>
    </footer>
  );
}
