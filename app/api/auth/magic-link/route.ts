import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { createStatelessAuthClient } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site-url";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, captchaToken, hostSlug } = body;

  if (!email) {
    return NextResponse.json(
      { error: "E-Mail-Adresse ist erforderlich." },
      { status: 400 }
    );
  }

  // Verify Turnstile captcha
  const captchaResult = await verifyTurnstileToken(captchaToken || "");
  if (!captchaResult.ok) {
    return NextResponse.json(
      { error: "Captcha-Verifizierung fehlgeschlagen." },
      { status: 400 }
    );
  }

  const supabase = createStatelessAuthClient();
  const siteUrl = getSiteUrl();

  // Build redirect URL — include host slug for claim flow
  let redirectTo = `${siteUrl}/auth/callback`;
  if (hostSlug) {
    redirectTo += `?host=${encodeURIComponent(hostSlug)}`;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: "Magic Link konnte nicht gesendet werden. Bitte versuche es erneut." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
