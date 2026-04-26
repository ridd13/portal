import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { getSupabaseServerClient } from "@/lib/supabase";
import { deduplicateEvents } from "@/lib/event-utils";
import type { Category, Event } from "@/lib/types";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as Category | null;
}

async function getCategoryEvents(categorySlug: string): Promise<Event[]> {
  const supabase = getSupabaseServerClient();

  // Get event IDs for this category
  const { data: catEvents } = await supabase
    .from("event_categories")
    .select("event_id, categories!inner(slug)")
    .eq("categories.slug", categorySlug);

  const eventIds = (catEvents || []).map((row: { event_id: string }) => row.event_id);
  if (eventIds.length === 0) return [];

  const { data } = await supabase
    .from("events")
    .select("*, hosts(name, slug)")
    .in("id", eventIds)
    .eq("is_public", true)
    .eq("status", "published")
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true });

  return deduplicateEvents((data || []) as Event[]);
}

async function getRelatedCategories(currentSlug: string, groupName: string): Promise<Category[]> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("group_name", groupName)
    .neq("slug", currentSlug)
    .order("sort_order", { ascending: true });
  return (data || []) as Category[];
}

export async function generateStaticParams() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("slug");
  return (data || []).map((cat: { slug: string }) => ({ slug: cat.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Kategorie nicht gefunden" };

  return {
    title: `${category.name_de} – Events, Workshops & Retreats | Das Portal`,
    description: `${category.name_de}-Angebote in Norddeutschland: ${category.description_de || "Events, Workshops und Retreats"}. Finde dein nächstes Erlebnis auf Das Portal.`,
    alternates: {
      canonical: `/kategorie/${category.slug}`,
    },
    openGraph: {
      title: `${category.name_de} – Das Portal`,
      description: `${category.description_de || category.name_de} – Events, Workshops und Retreats in deiner Nähe.`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const events = await getCategoryEvents(slug);
  const related = await getRelatedCategories(slug, category.group_name);

  // Count by format
  const formatCounts = events.reduce<Record<string, number>>((acc, e) => {
    const fmt = e.event_format || "event";
    acc[fmt] = (acc[fmt] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-3xl bg-linear-to-br from-[#f5ece1] via-[#f4ebe5] to-[#dce2d5] p-6 shadow-[0_8px_28px_rgba(44,36,24,0.08)] sm:p-8">
        <p className="mb-2 text-sm uppercase tracking-[0.18em] text-text-secondary">
          {category.group_name}
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl">
          {category.name_de}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-text-secondary">
          {category.description_de}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-text-muted">
          <span>{events.length} kommende Angebote</span>
          {formatCounts.retreat ? (
            <span>davon {formatCounts.retreat} Retreats</span>
          ) : null}
          {formatCounts.workshop ? (
            <span>{formatCounts.workshop} Workshops</span>
          ) : null}
        </div>
      </section>

      {/* SEO Content Block */}
      <section className="prose prose-lg max-w-3xl text-text-secondary">
        <h2 className="font-serif text-2xl text-text-primary">
          {category.name_de} — aktuelle Angebote
        </h2>
        <p>
          Auf Das Portal findest du {category.name_de}-Angebote von erfahrenen
          Anbietern aus Schleswig-Holstein und Hamburg. Ob Anfänger oder
          erfahren – stöbere durch unsere Auswahl an Events, Workshops und Retreats
          und finde das passende Angebot für dich.
        </p>
      </section>

      {/* Quick Filter Links */}
      <section className="flex flex-wrap gap-3">
        <Link
          href={`/events?kategorie=${slug}`}
          className="rounded-full border border-accent-primary bg-accent-primary/10 px-4 py-2 text-sm font-medium text-accent-primary"
        >
          Alle {category.name_de}
        </Link>
        {formatCounts.retreat ? (
          <Link
            href={`/events?kategorie=${slug}&format=retreat`}
            className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
          >
            {category.name_de}-Retreats
          </Link>
        ) : null}
        {formatCounts.workshop ? (
          <Link
            href={`/events?kategorie=${slug}&format=workshop`}
            className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
          >
            {category.name_de}-Workshops
          </Link>
        ) : null}
      </section>

      {/* Event Grid */}
      {events.length > 0 ? (
        <section>
          <h2 className="mb-6 font-serif text-2xl text-text-primary">
            Nächste {category.name_de}-Termine
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {events.slice(0, 12).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {events.length > 12 ? (
            <div className="mt-8 text-center">
              <Link
                href={`/events?kategorie=${slug}`}
                className="rounded-full border border-accent-secondary bg-bg-card px-6 py-2.5 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary"
              >
                Alle {events.length} {category.name_de}-Angebote anzeigen
              </Link>
            </div>
          ) : null}
        </section>
      ) : (
        <div className="rounded-2xl border border-border bg-bg-card p-10 text-center text-text-secondary">
          Aktuell keine {category.name_de}-Events geplant. Schau bald wieder vorbei!
        </div>
      )}

      {/* Related Categories */}
      {related.length > 0 ? (
        <section>
          <h2 className="mb-4 font-serif text-xl text-text-primary">
            Ähnliche Kategorien
          </h2>
          <div className="flex flex-wrap gap-3">
            {related.map((cat) => (
              <Link
                key={cat.slug}
                href={`/kategorie/${cat.slug}`}
                className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-accent-primary"
              >
                {cat.name_de}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${category.name_de} – Das Portal`,
            description: category.description_de,
            url: `https://das-portal.online/kategorie/${category.slug}`,
            itemListElement: events.slice(0, 10).map((event, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Event",
                name: event.title,
                startDate: event.start_at,
                url: `https://das-portal.online/events/${event.slug}`,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
