import type { MetadataRoute } from "next";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Region overview pages
  const regionPages = ["hamburg", "schleswig-holstein"];

  // City/category landing pages (erweiterbar — neue Einträge hier hinzufügen)
  const cityLandingPages = [
    { city: "hamburg", category: "ganzheitliche-events" },
    { city: "hamburg", category: "spirituelle-events" },
    { city: "hamburg", category: "kakaozeremonie" },
    { city: "hamburg", category: "yoga" },
    { city: "hamburg", category: "meditation" },
    { city: "hamburg", category: "breathwork" },
    { city: "schleswig-holstein", category: "ganzheitliche-events" },
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/fuer-facilitators`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/kontakt`, changeFrequency: "monthly", priority: 0.3 },
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
  ];

  try {
    const supabase = getSupabaseServerClient();

    // Kategorie-Landing-Pages dynamisch aus DB
    const { data: categories } = await supabase
      .from("categories")
      .select("slug")
      .order("sort_order", { ascending: true });

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map(
      (cat: { slug: string }) => ({
        url: `${siteUrl}/kategorie/${cat.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    );

    // Aktuelle Events (nur zukünftige)
    const { data: events } = await supabase
      .from("events")
      .select("slug, created_at")
      .eq("is_public", true)
      .eq("status", "published")
      .gte("start_at", new Date().toISOString())
      .limit(500);

    const eventRoutes: MetadataRoute.Sitemap = (events || [])
      .filter((e: { slug: string | null }) => e.slug)
      .map((e: { slug: string; created_at: string | null }) => ({
        url: `${siteUrl}/events/${e.slug}`,
        lastModified: e.created_at || new Date().toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    // Hosts (nur wenn Events vorhanden — ohne Events keine Hosts indexieren)
    const hostRoutes: MetadataRoute.Sitemap = eventRoutes.length > 0
      ? await (async () => {
          const { data: hosts } = await supabase
            .from("hosts")
            .select("slug, created_at")
            .not("slug", "is", null)
            .limit(200);
          return (hosts || [])
            .filter((h: { slug: string | null }) => h.slug)
            .map((h: { slug: string; created_at: string | null }) => ({
              url: `${siteUrl}/hosts/${h.slug}`,
              lastModified: h.created_at || new Date().toISOString(),
              changeFrequency: "monthly" as const,
              priority: 0.6,
            }));
        })()
      : [];

    return [...staticRoutes, ...categoryRoutes, ...eventRoutes, ...hostRoutes];
  } catch {
    return staticRoutes;
  }
}
