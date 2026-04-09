import type { Metadata } from "next";
import Link from "next/link";
import { SubmitLocationForm } from "@/components/SubmitLocationForm";

export const metadata: Metadata = {
  title: "Ort hinzufügen – Das Portal",
  description: "Füge einen besonderen Ort für ganzheitliche Events bei Das Portal hinzu.",
};

export default function SubmitLocationPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/einreichen" className="text-sm text-text-muted hover:text-accent-primary">
          &larr; Zurück
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-text-primary">
          Ort hinzufügen
        </h1>
        <p className="mt-2 text-text-secondary">
          Teile einen besonderen Ort für Events und Workshops. Pflichtfelder sind mit * markiert.
        </p>
      </div>

      <SubmitLocationForm />
    </div>
  );
}
