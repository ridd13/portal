import Image from "next/image";
import Link from "next/link";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg-primary/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight text-text-primary"
        >
          <Image
            src="/logo.png"
            alt="Das Portal Logo"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span>Das Portal</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-text-secondary">
          <Link
            href="/events"
            className="rounded-full px-3 py-2 transition hover:bg-bg-secondary hover:text-text-primary"
          >
            Events
          </Link>
          <a
            href="https://t.me/dasgrosseportal"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full px-2 py-2 text-accent-primary transition hover:bg-bg-secondary"
            aria-label="Telegram-Kanal"
          >
            <TelegramIcon className="h-5 w-5" />
          </a>
          <Link
            href="/#warteliste"
            className="rounded-full border border-accent-primary px-4 py-2 text-accent-primary transition hover:bg-accent-primary hover:text-white"
          >
            Auf die Warteliste
          </Link>
        </nav>
      </div>
    </header>
  );
}
