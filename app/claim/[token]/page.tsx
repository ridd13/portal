import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ClaimForm } from "./ClaimForm";

export const metadata: Metadata = {
  title: "Eintrag übernehmen – Das Portal",
  robots: { index: false, follow: false },
};

type EntityType = "event" | "host" | "location";

type ClaimTarget = {
  type: EntityType;
  id: string;
  title: string;
  claimStatus: string | null;
  claimEmail: string | null;
  claimSentAt: string | null;
  claimedAt: string | null;
  description: string | null;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

async function findByToken(token: string): Promise<ClaimTarget | null> {
  const supabase = getSupabaseAdminClient();

  // Try events
  {
    const { data } = await supabase
      .from("events")
      .select("id, title, description, claim_status, claim_email, claim_sent_at, claimed_at")
      .eq("claim_token", token)
      .maybeSingle();
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = data as any;
      return {
        type: "event",
        id: row.id,
        title: row.title,
        claimStatus: row.claim_status,
        claimEmail: row.claim_email,
        claimSentAt: row.claim_sent_at,
        claimedAt: row.claimed_at,
        description: row.description,
      };
    }
  }

  // Try hosts
  {
    const { data } = await supabase
      .from("hosts")
      .select("id, name, description, claim_status, claim_email, claim_sent_at, claimed_at")
      .eq("claim_token", token)
      .maybeSingle();
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = data as any;
      return {
        type: "host",
        id: row.id,
        title: row.name,
        claimStatus: row.claim_status,
        claimEmail: row.claim_email,
        claimSentAt: row.claim_sent_at,
        claimedAt: row.claimed_at,
        description: row.description,
      };
    }
  }

  // Try locations
  {
    const { data } = await supabase
      .from("locations")
      .select("id, name, description, claim_status, claim_email, claim_sent_at, claimed_at")
      .eq("claim_token", token)
      .maybeSingle();
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = data as any;
      return {
        type: "location",
        id: row.id,
        title: row.name,
        claimStatus: row.claim_status,
        claimEmail: row.claim_email,
        claimSentAt: row.claim_sent_at,
        claimedAt: row.claimed_at,
        description: row.description,
      };
    }
  }

  return null;
}

const TYPE_LABEL: Record<EntityType, string> = {
  event: "Event",
  host: "Profil",
  location: "Raum",
};

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token || token.length < 10) notFound();

  const target = await findByToken(token);
  if (!target) notFound();

  const label = TYPE_LABEL[target.type];

  // Already claimed
  if (target.claimStatus === "approved" || target.claimedAt) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="mb-4 font-serif text-3xl text-text-primary">Bereits übernommen</h1>
        <p className="text-text-secondary">Dieser Eintrag wurde bereits übernommen.</p>
      </main>
    );
  }

  // Expired
  if (target.claimSentAt) {
    const sent = new Date(target.claimSentAt).getTime();
    const nowMs = new Date().getTime();
    if (nowMs - sent > THIRTY_DAYS_MS) {
      return (
        <main className="mx-auto max-w-2xl px-4 py-16">
          <h1 className="mb-4 font-serif text-3xl text-text-primary">Link abgelaufen</h1>
          <p className="text-text-secondary">
            Dieser Link ist abgelaufen. Bitte kontaktiere uns unter{" "}
            <a href="mailto:lb@justclose.de" className="text-accent-primary underline">
              lb@justclose.de
            </a>
            , wenn du den Eintrag noch übernehmen möchtest.
          </p>
        </main>
      );
    }
  }

  // Already requested
  if (target.claimStatus === "requested") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="mb-4 font-serif text-3xl text-text-primary">Anfrage erhalten</h1>
        <p className="text-text-secondary">
          Wir haben deine Anfrage bereits erhalten und prüfen sie. Du bekommst innerhalb von 48 Stunden eine Rückmeldung per E-Mail.
        </p>
      </main>
    );
  }

  // Rejected
  if (target.claimStatus === "rejected") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="mb-4 font-serif text-3xl text-text-primary">Anfrage nicht bestätigt</h1>
        <p className="text-text-secondary">
          Wir konnten deine Anfrage nicht bestätigen. Bitte melde dich bei uns unter{" "}
          <a href="mailto:lb@justclose.de" className="text-accent-primary underline">
            lb@justclose.de
          </a>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl text-text-primary">
        {label} übernehmen
      </h1>
      <p className="mb-8 text-text-secondary">
        Jemand hat diesen Eintrag für dich angelegt. Wenn das dein {label.toLowerCase()} ist, kannst du ihn hier übernehmen.
      </p>

      <div className="mb-8 rounded-xl border border-border bg-bg-card p-5">
        <p className="mb-1 text-sm text-text-muted">Du übernimmst:</p>
        <h2 className="font-serif text-xl text-text-primary">{target.title}</h2>
        {target.description && (
          <p className="mt-2 line-clamp-4 text-sm text-text-secondary whitespace-pre-line">
            {target.description}
          </p>
        )}
      </div>

      <ClaimForm
        token={token}
        entityType={target.type}
        prefilledEmail={target.claimEmail ?? ""}
      />
    </main>
  );
}
