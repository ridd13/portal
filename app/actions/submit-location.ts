"use server";

import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase";
import { uploadImage } from "@/lib/upload-image";
import { sendClaimInvitation } from "@/lib/email";
import type { SubmitResult } from "./submit-event";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function submitLocation(
  _prev: SubmitResult,
  formData: FormData
): Promise<SubmitResult> {
  // Honeypot
  if (formData.get("website_url_confirm")) {
    return { success: true, message: "Danke für deine Einreichung!" };
  }

  const name = formData.get("name")?.toString().trim();
  const type = formData.get("type")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const address = formData.get("address")?.toString().trim() || null;
  const city = formData.get("city")?.toString().trim() || null;
  const postalCode = formData.get("postal_code")?.toString().trim() || null;
  const websiteUrl = formData.get("website_url")?.toString().trim() || null;
  const contactEmail = formData.get("contact_email")?.toString().trim().toLowerCase() || null;
  const phone = formData.get("phone")?.toString().trim() || null;
  const capacityRaw = formData.get("capacity")?.toString().trim();
  const amenitiesRaw = formData.get("amenities")?.toString().trim() || "";
  const overnightPossible = formData.get("overnight_possible") === "on";
  const wheelchairAccessible = formData.get("wheelchair_accessible") === "on";
  const isOwnEntry = formData.get("is_own_entry") === "yes";
  const isThirdParty = formData.get("is_own_entry") === "no";
  const claimEmailRaw = formData.get("claim_email")?.toString().trim().toLowerCase() || "";
  const claimEmail = isThirdParty && claimEmailRaw.includes("@") ? claimEmailRaw : null;
  const claimToken = claimEmail ? randomUUID() : null;

  if (!name || name.length < 2) {
    return { success: false, message: "Bitte gib einen Namen ein (mind. 2 Zeichen)." };
  }
  if (!type) {
    return { success: false, message: "Bitte wähle einen Typ aus." };
  }
  if (type !== "online" && !address) {
    return { success: false, message: "Bitte gib eine Adresse an." };
  }
  if (!isOwnEntry && !isThirdParty) {
    return { success: false, message: "Bitte wähle aus, ob das dein eigener Raum ist." };
  }

  const capacity = capacityRaw ? parseInt(capacityRaw, 10) : null;
  const amenities = amenitiesRaw
    ? amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : null;

  const slug = slugify(name) + "-" + Date.now().toString(36);

  // Photo upload
  const photoFile = formData.get("photo") as File | null;
  let coverImageUrl: string | null = null;
  if (photoFile && photoFile.size > 0) {
    coverImageUrl = await uploadImage(photoFile, "locations", slug);
  }

  const supabase = getSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("locations") as any).insert({
    name,
    slug,
    type,
    description,
    address,
    city,
    postal_code: postalCode,
    website_url: websiteUrl,
    contact_email: contactEmail,
    phone,
    capacity,
    amenities,
    overnight_possible: overnightPossible,
    wheelchair_accessible: wheelchairAccessible,
    cover_image_url: coverImageUrl,
    submitted_by_third_party: isThirdParty,
    claim_email: claimEmail,
    claim_token: claimToken,
    claim_status: claimToken ? "invited" : "none",
    claim_sent_at: claimToken ? new Date().toISOString() : null,
  });

  if (error) {
    console.error("Location submit error:", error);
    return { success: false, message: "Etwas ist schiefgelaufen. Bitte versuche es erneut." };
  }

  if (claimToken && claimEmail) {
    try {
      await sendClaimInvitation({
        email: claimEmail,
        entityType: "location",
        entityTitle: name,
        claimToken,
      });
    } catch (err) {
      console.error("Claim invitation email failed:", err);
    }
  }

  return {
    success: true,
    message: "Danke! Der Ort wurde eingereicht und wird geprüft.",
  };
}
