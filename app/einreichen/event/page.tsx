import type { Metadata } from "next";
import Link from "next/link";
import { SubmitEventForm } from "@/components/SubmitEventForm";

export const metadata: Metadata = {
  title: "Event einreichen – Das Portal",
  description: "Reiche dein Event bei Das Portal ein – kostenlos und ohne Registrierung.",
  alternates: { canonical: "https://das-portal.online/einreichen/event" },
};

export default function SubmitEventPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/einreichen" className="text-sm text-text-muted hover:text-accent-primary">
          &larr; Zurück
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-text-primary">
          Event einreichen
        </h1>
        <p className="mt-2 text-text-secondary">
          Stelle dein Event auf Das Portal vor. Pflichtfelder sind mit * markiert.
        </p>
      </div>

      <SubmitEventForm />
    </div>
  );
}
