"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav() {
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
              Veranstaltungen
            </Link>
            <Link
              href="/locations"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
            >
              Räume
            </Link>
            <Link
              href="/anbieter"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary"
            >
              Raumhalter
            </Link>
            <div className="my-1 border-t border-border" />
            <Link
              href="/einreichen"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-accent-primary px-3 py-2.5 text-center text-sm font-medium text-white transition hover:brightness-110"
            >
              Eintragen
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
