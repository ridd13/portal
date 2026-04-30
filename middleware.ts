import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth-cookies";

/** Known city slugs (lowercase) that should render the event list, not event detail. */
const CITY_SLUGS = new Set([
  "hamburg",
  "kiel",
  "luebeck",
  "lübeck",
  "flensburg",
  "neumuenster",
  "neumünster",
  "norderstedt",
  "elmshorn",
  "pinneberg",
  "itzehoe",
  "rendsburg",
  "husum",
  "heide",
  "schleswig",
  "ahrensburg",
  "bad-segeberg",
  "bad-oldesloe",
  "wedel",
  "geesthacht",
  "reinbek",
  "bargteheide",
  "henstedt-ulzburg",
]);

const PLZ_REGEX = /^\d{5}$/;

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // --- City-Slug / PLZ rewrite for /events/<location> ---
  const cityMatch = pathname.match(/^\/events\/([^/]+)$/);
  if (cityMatch) {
    const segment = decodeURIComponent(cityMatch[1]).toLowerCase();

    if (CITY_SLUGS.has(segment)) {
      // Rewrite to /events?city=<City> (capitalise first letter for display)
      const cityName = segment.charAt(0).toUpperCase() + segment.slice(1);
      const url = request.nextUrl.clone();
      url.pathname = "/events";
      url.searchParams.set("city", cityName);
      return NextResponse.rewrite(url);
    }

    if (PLZ_REGEX.test(segment)) {
      // Rewrite to /events?plz=<PLZ>
      const url = request.nextUrl.clone();
      url.pathname = "/events";
      url.searchParams.set("plz", segment);
      return NextResponse.rewrite(url);
    }
  }

  // --- Redirect old query-param style to SEO-friendly URL ---
  if (pathname === "/events" && request.nextUrl.searchParams.has("city")) {
    const city = request.nextUrl.searchParams.get("city")!.trim();
    if (city && !request.nextUrl.searchParams.has("tag") && !request.nextUrl.searchParams.has("q")) {
      const slug = city.toLowerCase().replace(/\s+/g, "-");
      if (CITY_SLUGS.has(slug)) {
        const url = request.nextUrl.clone();
        url.pathname = `/events/${slug}`;
        url.searchParams.delete("city");
        return NextResponse.redirect(url, 301);
      }
    }
  }

  // --- Redirect old /anbieter URL to /hosts ---
  if (pathname === "/anbieter") {
    const url = request.nextUrl.clone();
    url.pathname = "/hosts";
    return NextResponse.redirect(url, 308);
  }

  // --- Auth guard for /konto ---
  if (pathname.startsWith("/konto")) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/auth", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    // Sync portal-access-token after potential SSR token refresh so server
    // components and server actions (which read ACCESS_COOKIE) stay in sync.
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      response.cookies.set(ACCESS_COOKIE, session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: session.expires_in,
      });
      response.cookies.set(REFRESH_COOKIE, session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/konto/:path*", "/events/:path*", "/anbieter"],
};
