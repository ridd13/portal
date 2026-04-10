"use server";

import { getSupabaseServerClient } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload-image";

export type SubmitResult = {
  success: boolean;
  message: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function submitEvent(
  _prev: SubmitResult,
  formData: FormData
): Promise<SubmitResult> {
  // Honeypot check
  if (formData.get("website_url_confirm")) {
    return { success: true, message: "Danke für deine Einreichung!" };
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const startAt = formData.get("start_at")?.toString().trim();
  const endAt = formData.get("end_at")?.toString().trim() || null;
  const locationName = formData.get("location_name")?.toString().trim() || null;
  const address = formData.get("address")?.toString().trim() || null;
  const tagsRaw = formData.get("tags")?.toString().trim() || "";
  const capacityRaw = formData.get("capacity")?.toString().trim();
  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null;
  const priceModel = formData.get("price_model")?.toString().trim() || null;
  const priceAmount = formData.get("price_amount")?.toString().trim() || null;
  const ticketLink = formData.get("ticket_link")?.toString().trim() || null;
  const contactEmail = formData.get("contact_email")?.toString().trim().toLowerCase();

  // Validation
  if (!title || title.length < 3) {
    return { success: false, message: "Bitte gib einen Titel ein (mind. 3 Zeichen)." };
  }
  if (!startAt) {
    return { success: false, message: "Bitte gib ein Startdatum an." };
  }
  if (!contactEmail || !contactEmail.includes("@")) {
    return { success: false, message: "Bitte gib eine gültige E-Mail-Adresse an." };
  }
  if (endAt && new Date(endAt) <= new Date(startAt)) {
    return { success: false, message: "Das Enddatum muss nach dem Startdatum liegen." };
  }

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : null;

  const slug = slugify(title) + "-" + Date.now().toString(36);

  // Photo upload
  const photoFile = formData.get("photo") as File | null;
  let coverImageUrl: string | null = null;
  if (photoFile && photoFile.size > 0) {
    coverImageUrl = await uploadImage(photoFile, "events", slug);
  }

  const supabase = getSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("events") as any).insert({
    title,
    slug,
    description,
    start_at: new Date(startAt).toISOString(),
    end_at: endAt ? new Date(endAt).toISOString() : null,
    location_name: locationName,
    address,
    tags,
    price_model: priceModel,
    price_amount: priceAmount,
    ticket_link: ticketLink,
    cover_image_url: coverImageUrl,
    capacity,
    waitlist_enabled: capacity !== null,
    registration_enabled: true,
    source_type: "form",
    is_public: true,
  });

  if (error) {
    console.error("Event submit error:", error);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  return {
    success: true,
    message: "Danke! Dein Event wurde eingereicht und wird geprüft.",
  };
}
