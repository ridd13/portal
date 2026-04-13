import type { MetadataRoute } from "next";
import { getSupabaseServerClient } from "@/lib/supabase";

const siteUrl = "https://das-portal.online";

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
    { city: "hamburg", category: "ecstatic-dance" },
    { city: "hamburg", category: "retreat" },
    { city: "hamburg", category: "soundhealing" },
    { city: "hamburg", category: "frauenkreis" },
    { city: "hamburg", category: "tantra" },
    { city: "schleswig-holstein", category: "ganzheitliche-events" },
    { city: "kiel", category: "breathwork" },
    { city: "kiel", category: "ganzheitliche-events" },
    { city: "berlin", category: "ganzheitliche-events" },
    { city: "muenchen", category: "ganzheitliche-events" },
    { city: "stuttgart", category: "ganzheitliche-events" },
    { city: "freiburg", category: "ganzheitliche-events" },
    { city: "schwarzwald", category: "ganzheitliche-events" },
  ];

  // Additional city/region overview pages
  const cityPages = ["bremen", "kiel", "rostock", "niedersachsen", "mecklenburg-vorpommern"];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/locations`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/hosts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/einreichen`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/fuer-facilitators`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/kontakt`, changeFrequency: "monthly", priority: 0.3 },
    ...regionPages.map((region) => ({
      url: `${siteUrl}/${region}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...cityPages.map((city) => ({
      url: `${siteUrl}/${city}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
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

    // Alle published Events (auch vergangene — haben SEO-Wert)
    const { data: events } = await supabase
      .from("events")
      .select("slug, created_at, start_at")
      .eq("is_public", true)
      .eq("status", "published")
      .order("start_at", { ascending: false })
      .limit(1000);

    const now = new Date();
    const eventRoutes: MetadataRoute.Sitemap = (events || [])
      .filter((e: { slug: string | null }) => e.slug)
      .map((e: { slug: string; created_at: string | null; start_at: string }) => {
        const isFuture = new Date(e.start_at) > now;
        return {
          url: `${siteUrl}/events/${e.slug}`,
          lastModified: e.created_at || now.toISOString(),
          changeFrequency: isFuture ? "weekly" as const : "monthly" as const,
          priority: isFuture ? 0.8 : 0.5,
        };
      });

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

    // Locations
    const { data: locations } = await supabase
      .from("locations")
      .select("slug, created_at")
      .not("slug", "is", null)
      .limit(500);
    const locationRoutes: MetadataRoute.Sitemap = (locations || [])
      .filter((l: { slug: string | null }) => l.slug)
      .map((l: { slug: string; created_at: string | null }) => ({
        url: `${siteUrl}/locations/${l.slug}`,
        lastModified: l.created_at || now.toISOString(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...categoryRoutes, ...eventRoutes, ...hostRoutes, ...locationRoutes];
  } catch {
    return staticRoutes;
  }
}
