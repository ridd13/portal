import type { MetadataRoute } from "next";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/auth`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/impressum`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/datenschutz`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/kontakt`, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const supabase = getSupabaseServerClient();
    const { data: events } = await supabase
      .from("events")
      .select("slug, created_at")
      .eq("is_public", true)
      .eq("status", "published")
      .limit(500);
    const { data: hosts } = await supabase
      .from("hosts")
      .select("slug, created_at")
      .not("slug", "is", null)
      .limit(500);

    const eventRoutes: MetadataRoute.Sitemap = (events || [])
      .filter((event: { slug: string | null; created_at: string | null }) => event.slug)
      .map((event: { slug: string; created_at: string | null }) => ({
        url: `${siteUrl}/events/${event.slug}`,
        lastModified: event.created_at || new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    const hostRoutes: MetadataRoute.Sitemap = (hosts || [])
      .filter((host: { slug: string | null; created_at: string | null }) => host.slug)
      .map((host: { slug: string; created_at: string | null }) => ({
        url: `${siteUrl}/hosts/${host.slug}`,
        lastModified: host.created_at || new Date().toISOString(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));

    return [...staticRoutes, ...eventRoutes, ...hostRoutes];
  } catch {
    return staticRoutes;
  }
}
