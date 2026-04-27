import Link from "next/link";
import { NewsletterCaptureForm } from "@/components/NewsletterCaptureForm";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-text-secondary sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <p className="mb-3 text-sm font-medium text-text-primary">
            Hamburg diese Woche — Newsletter
          </p>
          <NewsletterCaptureForm variant="compact" source="footer" />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/impressum" className="transition hover:text-text-primary">
            Impressum
          </Link>
          <Link href="/datenschutz" className="transition hover:text-text-primary">
            Datenschutz
          </Link>
          <Link href="/fuer-facilitators" className="transition hover:text-text-primary">
            Für Anbieter
          </Link>
          <Link href="/kontakt" className="transition hover:text-text-primary">
            Kontakt
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span>Regionen:</span>
          {[
            { label: "Hamburg", href: "/events?city=Hamburg" },
            { label: "Kiel", href: "/events?city=Kiel" },
            { label: "Freiburg", href: "/events?city=Freiburg" },
            { label: "Berlin", href: "/events?city=Berlin" },
            { label: "München", href: "/events?city=München" },
            { label: "Köln", href: "/events?city=Köln" },
            { label: "Lübeck", href: "/events?city=Lübeck" },
            { label: "Stuttgart", href: "/events?city=Stuttgart" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="transition hover:text-text-primary">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          <span>Kategorien:</span>
          {[
            { label: "Yoga", href: "/events?tag=yoga" },
            { label: "Breathwork", href: "/events?tag=breathwork" },
            { label: "Meditation", href: "/events?tag=meditation" },
            { label: "Tanz", href: "/events?tag=tanz" },
            { label: "Sound Healing", href: "/events?tag=sound+healing" },
            { label: "Retreats", href: "/events?format=retreat" },
            { label: "Workshops", href: "/events?format=workshop" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="transition hover:text-text-primary">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
