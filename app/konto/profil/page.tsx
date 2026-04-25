import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ProfileEditorFull } from "@/components/ProfileEditorFull";
import type { Host } from "@/lib/types";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ claimed?: string }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect("/auth?next=/konto/profil");

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) redirect("/auth?next=/konto/profil");

  const supabase = getSupabaseAdminClient();
  const params = await searchParams;
  const justClaimed = params.claimed === "1";

  const { data: host } = await supabase
    .from("hosts")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!host) {
    return (
      <div className="space-y-4 rounded-2xl border border-border bg-bg-secondary p-6 text-center">
        <div>
          <p className="font-medium text-text-primary">Kein Raumhalter:innen-Profil gefunden</p>
          <p className="mt-1 text-sm text-text-secondary">
            Wenn du bereits als Raumhalter:in auf Das Portal gelistet bist, kannst du dein Profil auf deiner Profilseite beanspruchen.
          </p>
        </div>
        <Link
          href="/hosts"
          className="inline-block rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-primary"
        >
          Raumhalter:innen durchsuchen
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {justClaimed ? (
        <div className="rounded-2xl border border-success-border bg-success-bg p-5">
          <p className="font-medium text-success-text">Willkommen — du hast dein Profil übernommen.</p>
          <p className="mt-1 text-sm text-success-text">
            Du kannst jetzt Beschreibung, Logo, Links und Kontaktdaten anpassen. Änderungen sind sofort live.
          </p>
        </div>
      ) : null}
      <h2 className="text-2xl font-normal text-text-primary">Profil bearbeiten</h2>
      <div className="rounded-2xl border border-border bg-bg-card p-6">
        <ProfileEditorFull host={host as Host} />
      </div>
    </div>
  );
}
