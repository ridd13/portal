"use client";

import { useState } from "react";
import { createMcpToken, deleteMcpToken } from "@/app/actions/mcp-tokens";

interface Token {
  id: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string;
}

export function McpTokenList({
  initialTokens,
  userId,
}: {
  initialTokens: Token[];
  userId: string;
}) {
  const [tokens, setTokens] = useState<Token[]>(initialTokens);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createMcpToken(userId, label);
      if (result.success && result.token) {
        setNewToken(result.token);
        setTokens([result.data, ...tokens]);
        setLabel("");
      } else {
        alert("Fehler beim Erstellen des Tokens: " + result.error);
      }
    } catch {
      alert("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bist du sicher, dass du diesen Token löschen möchtest?")) return;
    try {
      const result = await deleteMcpToken(id);
      if (result.success) {
        setTokens(tokens.filter((t) => t.id !== id));
      } else {
        alert("Fehler beim Löschen des Tokens: " + result.error);
      }
    } catch {
      alert("Ein unerwarteter Fehler ist aufgetreten.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setNewToken(null);
            setIsModalOpen(true);
          }}
          className="rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-primary/90"
        >
          Neuen Token erstellen
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg-secondary text-text-muted">
            <tr>
              <th className="px-6 py-3 font-medium">Label</th>
              <th className="px-6 py-3 font-medium">Erstellt am</th>
              <th className="px-6 py-3 font-medium">Zuletzt genutzt</th>
              <th className="px-6 py-3 font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-text-muted">
                  Keine Tokens vorhanden.
                </td>
              </tr>
            ) : (
              tokens.map((token) => (
                <tr key={token.id}>
                  <td className="px-6 py-4 font-medium text-text-primary">{token.label}</td>
                  <td className="px-6 py-4 text-text-secondary">
                    {new Date(token.created_at).toLocaleDateString("de-DE")}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {token.last_used_at
                      ? new Date(token.last_used_at).toLocaleString("de-DE")
                      : "Nie"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(token.id)}
                      className="text-error-text hover:underline"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-bg-card p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-text-primary">
              {newToken ? "Token erstellt" : "Neuen Token erstellen"}
            </h3>

            {newToken ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-text-secondary">
                  Bitte kopiere diesen Token jetzt. Er wird nur dieses eine Mal angezeigt!
                </p>
                <div className="rounded-lg border border-border bg-bg-secondary p-3 font-mono text-sm break-all">
                  {newToken}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full rounded-full bg-accent-primary py-2 font-semibold text-white"
                >
                  Schließen
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary">Label</label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="z.B. Claude Desktop"
                    className="mt-1 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 rounded-full border border-border py-2 text-sm font-medium text-text-secondary"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-full bg-accent-primary py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {isSubmitting ? "Wird erstellt…" : "Erstellen"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
