"use client";

import { useState } from "react";
import Link from "next/link";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

interface MobileNavProps {
  isLoggedIn: boolean;
}

export function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={open}
      >
        {open ? (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-b border-border bg-bg-primary/98 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            <Link
              href="/events"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
            >
              Events
            </Link>
            <Link
              href="/locations"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
            >
              Orte
            </Link>
            <Link
              href="/anbieter"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
            >
              Raumhalter:innen
            </Link>
            <Link
              href="/fuer-facilitators"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
            >
              Für Anbieter:innen
            </Link>
            <a
              href="https://t.me/dasgrosseportal"
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
            >
              <TelegramIcon className="h-4 w-4 text-accent-primary" />
              Telegram-Kanal
            </a>
            <div className="my-1 border-t border-border" />
            {isLoggedIn ? (
              <Link
                href="/konto"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-accent-primary px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:brightness-95"
              >
                Mein Konto
              </Link>
            ) : (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-accent-primary px-3 py-2.5 text-center text-sm font-semibold text-accent-primary transition hover:bg-bg-secondary"
              >
                Anmelden
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
