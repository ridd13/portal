import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

type Props = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function AuthPage({ searchParams }: Props) {
  const { mode } = await searchParams;

  let subtitle: string;
  if (mode === "login") {
    subtitle = "Mit E-Mail und Passwort anmelden.";
  } else if (mode === "signup") {
    subtitle = "E-Mail und Passwort wählen, um ein neues Konto zu erstellen.";
  } else {
    subtitle = "Gib deine E-Mail ein — du bekommst einen Anmelde-Link zugeschickt.";
  }

  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.16em] text-text-secondary">
          Zugang
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-text-primary">
          Anmelden bei Das Portal
        </h1>
        <p className="mt-3 text-text-secondary">{subtitle}</p>
      </section>
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  );
}
