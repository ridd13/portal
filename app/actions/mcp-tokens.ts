"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import crypto from "crypto";

export async function createMcpToken(userId: string, label: string) {
  const supabase = getSupabaseAdminClient();
  
  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 365); // 1 year expiry by default

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const { data, error } = await supabase
    .from("mcp_tokens")
    .insert({
      user_id: userId,
      label,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/konto/mcp-tokens");
  return { success: true, token, data };
}

export async function deleteMcpToken(id: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("mcp_tokens")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/konto/mcp-tokens");
  return { success: true };
}
