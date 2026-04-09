import type { Metadata } from "next";
import Link from "next/link";
import { SubmitHostForm } from "@/components/SubmitHostForm";

export const metadata: Metadata = {
  title: "Profil erstellen – Das Portal",
  description: "Erstelle dein Profil als Facilitator, Coach oder Heiler:in auf Das Portal.",
};

export default function SubmitHostPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/einreichen" className="text-sm text-text-muted hover:text-accent-primary">
          &larr; Zurück
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-text-primary">
          Profil erstellen
        </h1>
        <p className="mt-2 text-text-secondary">
          Zeig dich und dein Angebot auf Das Portal. Pflichtfelder sind mit * markiert.
        </p>
      </div>

      <SubmitHostForm />
    </div>
  );
}
