import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { createStatelessAuthClient } from "@/lib/supabase";

interface ResetPayload {
  email?: string;
  captchaToken?: string;
  redirectTo?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ResetPayload;
  const email = body.email?.trim();
  const captchaToken = body.captchaToken || "";
  const redirectTo = body.redirectTo;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const captcha = await verifyTurnstileToken(captchaToken, ip);
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  const supabase = createStatelessAuthClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
