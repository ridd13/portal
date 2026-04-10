"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { uploadImage } from "@/lib/upload-image";

export async function updateProfile(
  _prevState: { error: string | null; success: string | null },
  formData: FormData
) {
  // Auth check
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return { error: "Nicht authentifiziert.", success: null };

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) return { error: "Ungültige Sitzung.", success: null };

  const supabase = getSupabaseAdminClient();

  // Find host
  const { data: host } = await supabase
    .from("hosts")
    .select("id, slug")
    .eq("owner_id", user.id)
    .single();

  if (!host) return { error: "Kein Profil gefunden.", success: null };

  // Build updates
  const updates: Record<string, unknown> = {};

  const name = (formData.get("name") as string)?.trim();
  if (name) updates.name = name;

  const description = (formData.get("description") as string)?.trim();
  updates.description = description || null;

  const city = (formData.get("city") as string)?.trim();
  updates.city = city || null;

  const region = (formData.get("region") as string)?.trim();
  updates.region = region || null;

  const websiteUrl = (formData.get("website_url") as string)?.trim();
  updates.website_url = websiteUrl || null;

  const email = (formData.get("email") as string)?.trim();
  updates.email = email || null;

  const telegramUsername = (formData.get("telegram_username") as string)?.trim();
  updates.telegram_username = telegramUsername?.replace("@", "").toLowerCase() || null;

  // Social links
  const socialLinks: Record<string, string> = {};
  for (const platform of ["instagram", "facebook", "linkedin", "youtube"]) {
    const url = (formData.get(`social_${platform}`) as string)?.trim();
    if (url) socialLinks[platform] = url;
  }
  updates.social_links = Object.keys(socialLinks).length > 0 ? socialLinks : null;

  // Avatar upload
  const avatarFile = formData.get("avatar") as File | null;
  if (avatarFile && avatarFile.size > 0) {
    const avatarUrl = await uploadImage(avatarFile, "hosts", host.slug || host.id);
    if (avatarUrl) {
      updates.avatar_url = avatarUrl;
    }
  }

  // Update
  const { error: updateError } = await supabase
    .from("hosts")
    .update(updates)
    .eq("id", host.id)
    .eq("owner_id", user.id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    return { error: "Aktualisierung fehlgeschlagen.", success: null };
  }

  revalidatePath("/konto/profil");
  revalidatePath(`/hosts/${host.slug}`);
  return { error: null, success: "Profil wurde aktualisiert." };
}
