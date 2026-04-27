import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function AuthPage() {
  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.16em] text-text-secondary">
          Zugang
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-text-primary">
          Anmelden bei Das Portal
        </h1>
        <p className="mt-3 text-text-secondary">
          Gib deine E-Mail ein — du bekommst einen Anmelde-Link zugeschickt.
        </p>
      </section>
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  );
}
