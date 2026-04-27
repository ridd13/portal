import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendMagicLinkEmail } from "@/lib/email";

const SITE_URL = "https://das-portal.online";

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

  // Build redirect URL — include host slug for claim flow
  let redirectTo = `${SITE_URL}/auth/callback`;
  if (hostSlug) {
    redirectTo += `?host=${encodeURIComponent(hostSlug)}`;
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    console.error("Magic link generation error:", error);
    return NextResponse.json(
      { error: "Magic Link konnte nicht erstellt werden. Bitte versuche es erneut." },
      { status: 500 }
    );
  }

  try {
    await sendMagicLinkEmail(email, data.properties.action_link);
  } catch {
    return NextResponse.json(
      { error: "Magic Link konnte nicht gesendet werden. Bitte versuche es erneut." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
