import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg-primary/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-serif text-2xl font-semibold tracking-tight text-text-primary"
        >
          Portal
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-text-secondary">
          <Link
            href="/events"
            className="rounded-full px-3 py-2 transition hover:bg-bg-secondary hover:text-text-primary"
          >
            Events
          </Link>
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
