import { NextRequest, NextResponse } from "next/server";
import { createStatelessAuthClient } from "@/lib/supabase";
import { setAuthSessionCookies } from "@/lib/auth-session";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const hostSlug = searchParams.get("host");
  const siteUrl = getSiteUrl();

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/auth?error=missing_code`);
  }

  const supabase = createStatelessAuthClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(`${siteUrl}/auth?error=invalid_code`);
  }

  // Determine redirect destination
  let redirectPath = "/konto";
  if (hostSlug) {
    redirectPath = `/auth?mode=claim-confirm&host=${encodeURIComponent(hostSlug)}`;
  }

  const response = NextResponse.redirect(`${siteUrl}${redirectPath}`);

  // Set auth cookies
  setAuthSessionCookies(
    response,
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in
  );

  return response;
}
