import { getSupabaseAdminClient } from "@/lib/supabase-admin";

/**
 * Upload an image file (from FormData) to Supabase Storage.
 * Returns the public URL or null on failure.
 *
 * @param file - File object from formData.get("photo")
 * @param folder - Storage folder, e.g. "events", "locations", "hosts"
 * @param slug - Unique slug for the filename
 */
export async function uploadImage(
  file: File,
  folder: string,
  slug: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) return null;

  try {
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filePath = `${folder}/${slug}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseAdminClient();

    const { error } = await supabase.storage
      .from("covers")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error("Image upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("covers")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (e) {
    console.error("Image upload failed:", e);
    return null;
  }
}
