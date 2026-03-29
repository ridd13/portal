"use server";

import { getSupabaseServerClient } from "@/lib/supabase";

export type SuggestGroupResult = {
  success: boolean;
  message: string;
};

export async function suggestGroup(
  _prev: SuggestGroupResult,
  formData: FormData
): Promise<SuggestGroupResult> {
  const groupLink = formData.get("group_link")?.toString().trim();
  const groupName = formData.get("group_name")?.toString().trim() || null;
  const region = formData.get("region")?.toString().trim() || null;

  if (!groupLink) {
    return { success: false, message: "Bitte gib einen Telegram-Link ein." };
  }

  // Basic validation: muss ein Telegram-Link sein
  const isTelegramLink =
    groupLink.startsWith("https://t.me/") ||
    groupLink.startsWith("http://t.me/") ||
    groupLink.startsWith("t.me/") ||
    groupLink.startsWith("@");

  if (!isTelegramLink) {
    return {
      success: false,
      message: "Bitte gib einen gültigen Telegram-Link ein (z.B. https://t.me/gruppenname oder @gruppenname).",
    };
  }

  // Normalize: @handle → https://t.me/handle
  const normalizedLink = groupLink.startsWith("@")
    ? `https://t.me/${groupLink.slice(1)}`
    : groupLink.startsWith("t.me/")
      ? `https://${groupLink}`
      : groupLink;

  const supabase = getSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("telegram_sources") as any).insert({
    group_link: normalizedLink,
    group_name: groupName || normalizedLink.split("/").pop() || "Unbekannt",
    region: region || null,
    status: "suggested",
    notes: "Via Website vorgeschlagen",
  });

  if (error) {
    if (error.code === "23505") {
      return { success: true, message: "Diese Gruppe ist uns bereits bekannt — danke trotzdem!" };
    }
    console.error("Suggest group error:", error);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  return {
    success: true,
    message: "Danke für deinen Vorschlag! Wir prüfen die Gruppe und nehmen sie auf.",
  };
}
