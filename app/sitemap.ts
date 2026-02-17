import type { MetadataRoute } from "next";
import { getSupabaseServerClient } from "@/lib/supabase";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1.0 },
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
      .filter((event) => event.slug)
      .map((event) => ({
        url: `${siteUrl}/events/${event.slug}`,
        lastModified: event.created_at || new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const hostRoutes: MetadataRoute.Sitemap = (hosts || [])
      .filter((host) => host.slug)
      .map((host) => ({
        url: `${siteUrl}/hosts/${host.slug}`,
        lastModified: host.created_at || new Date().toISOString(),
        changeFrequency: "monthly",
        priority: 0.6,
      }));

    return [...staticRoutes, ...eventRoutes, ...hostRoutes];
  } catch {
    return staticRoutes;
  }
}
