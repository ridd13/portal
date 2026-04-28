import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { setAuthSessionCookies } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { access_token, refresh_token, expires_in } = body;

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  // Validate tokens and get user data via @supabase/ssr server client.
  // This also collects the ssr-format cookies (sb-<ref>-auth-token) needed by middleware.
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: (cookies) => {
          cookiesToSet.push(...cookies);
        },
      },
    }
  );

  const { data: sessionData, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error || !sessionData.session || !sessionData.user) {
    return NextResponse.json({ error: "Invalid or expired tokens" }, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true,
    user: {
      id: sessionData.user.id,
      email: sessionData.user.email,
    },
    expires_in: sessionData.session.expires_in,
  });

  // Set @supabase/ssr format cookies (used by middleware's getUser())
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  // Set custom portal-access-token cookie (used by Server Components + Server Actions)
  setAuthSessionCookies(
    response,
    sessionData.session.access_token,
    sessionData.session.refresh_token,
    sessionData.session.expires_in ?? expires_in ?? 3600
  );

  return response;
}
