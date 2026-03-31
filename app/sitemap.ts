import type { MetadataRoute } from "next";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Region overview pages — nur Regionen mit echtem Content
  const regionPages = ["hamburg", "schleswig-holstein"];

  // City landing pages — nur Seiten mit substantiellem Content
  const cityLandingPages = [
    { city: "hamburg", category: "ganzheitliche-events" },
    { city: "hamburg", category: "spirituelle-events" },
    { city: "schleswig-holstein", category: "ganzheitliche-events" },
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/events`, changeFrequency: "daily", priority: 0.9 },
    ...regionPages.map((region) => ({
      url: `${siteUrl}/${region}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...cityLandingPages.map(({ city, category }) => ({
      url: `${siteUrl}/${city}/${category}`,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    { url: `${siteUrl}/fuer-facilitators`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/kontakt`, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const supabase = getSupabaseServerClient();

    // Category landing pages
    const { data: categories } = await supabase
      .from("categories")
      .select("slug")
      .order("sort_order", { ascending: true });

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map(
      (cat: { slug: string }) => ({
        url: `${siteUrl}/kategorie/${cat.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })
    );

    const { data: events } = await supabase
      .from("events")
      .select("slug, created_at, start_at")
      .eq("is_public", true)
      .eq("status", "published")
      .gte("start_at", new Date().toISOString())
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

    return [...staticRoutes, ...categoryRoutes, ...eventRoutes, ...hostRoutes];
  } catch {
    return staticRoutes;
  }
}
