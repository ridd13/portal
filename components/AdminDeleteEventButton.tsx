"use client";

import { useState, useTransition } from "react";
import { deleteEvent } from "@/app/admin/actions";

interface Props {
  eventId: string;
  eventTitle: string;
}

export function AdminDeleteEventButton({ eventId, eventTitle }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEvent(eventId);
      if (result?.error) setError(result.error);
    });
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        Event löschen
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-800">
        Wirklich löschen: „{eventTitle}"?
      </p>
      <p className="mt-1 text-xs text-red-600">Diese Aktion kann nicht rückgängig gemacht werden.</p>
      {error ? <p className="mt-2 text-xs font-medium text-red-700">{error}</p> : null}
      <div className="mt-3 flex gap-3">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "Wird gelöscht…" : "Ja, löschen"}
        </button>
        <button
          onClick={() => { setShowConfirm(false); setError(null); }}
          disabled={isPending}
          className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-white"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
