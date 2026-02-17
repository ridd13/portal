"use client";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-[#e4b6a8] bg-[#f7e8e2] p-6">
      <h2 className="text-2xl font-semibold text-[#7a3f2c]">
        Ein Fehler ist aufgetreten
      </h2>
      <p className="mt-2 text-sm text-[#7a3f2c]">
        Bitte versuche es erneut. Wenn das Problem bleibt, lade die Seite neu.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
