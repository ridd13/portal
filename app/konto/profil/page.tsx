import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { ProfileEditorFull } from "@/components/ProfileEditorFull";
import type { Host } from "@/lib/types";

export default async function ProfilPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)!.value;
  const { user } = await getUserFromAccessToken(accessToken);
  const supabase = getSupabaseAdminClient();

  const { data: host } = await supabase
    .from("hosts")
    .select("*")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!host) {
    return (
      <div className="rounded-2xl border border-border bg-bg-secondary p-6 text-center">
        <p className="font-medium text-text-primary">Kein Raumhalter:innen-Profil gefunden</p>
        <p className="mt-1 text-sm text-text-secondary">
          Beanspruche zuerst dein Profil, um es bearbeiten zu können.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-normal text-text-primary">Profil bearbeiten</h2>
      <div className="rounded-2xl border border-border bg-bg-card p-6">
        <ProfileEditorFull host={host as Host} />
      </div>
    </div>
  );
}
