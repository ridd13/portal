import Link from "next/link";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { MobileNav } from "./MobileNav";

export async function Navbar() {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get(ACCESS_COOKIE)?.value;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg-primary/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-serif text-xl font-normal tracking-tight text-text-primary"
        >
          Das Portal
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-3 text-sm font-medium text-text-secondary sm:flex">
          <Link
            href="/events"
            className="rounded-full px-3 py-2 transition hover:bg-bg-secondary hover:text-text-primary"
          >
            Veranstaltungen
          </Link>
          <Link
            href="/locations"
            className="rounded-full px-3 py-2 transition hover:bg-bg-secondary hover:text-text-primary"
          >
            Räume
          </Link>
          <Link
            href="/hosts"
            className="rounded-full px-3 py-2 transition hover:bg-bg-secondary hover:text-text-primary"
          >
            Raumhalter
          </Link>
          <Link
            href="/einreichen"
            className="rounded-full bg-accent-primary px-4 py-2 text-white transition hover:brightness-110"
          >
            Eintragen
          </Link>
          {isLoggedIn && (
            <Link
              href="/konto"
              className="px-2 py-2 text-text-secondary transition hover:text-text-primary"
            >
              Mein Bereich
            </Link>
          )}
        </nav>

        {/* Mobile Nav */}
        <MobileNav isLoggedIn={isLoggedIn} />
      </div>
    </header>
  );
}
