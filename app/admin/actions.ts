"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const ADMIN_EMAIL = "lennert.bewernick@gmail.com";

async function requireAdmin() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;
  const { user } = await getUserFromAccessToken(accessToken);
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

export async function deleteEvent(eventId: string): Promise<{ error: string } | never> {
  const user = await requireAdmin();
  if (!user) return { error: "Nicht autorisiert." };

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { error: error.message };

  revalidatePath("/events");
  redirect("/events");
}
