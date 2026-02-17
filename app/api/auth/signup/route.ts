import { NextResponse } from "next/server";
import { setAuthSessionCookies } from "@/lib/auth-session";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { createStatelessAuthClient } from "@/lib/supabase";

interface SignupPayload {
  email?: string;
  password?: string;
  captchaToken?: string;
  emailRedirectTo?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as SignupPayload;
  const email = body.email?.trim();
  const password = body.password;
  const captchaToken = body.captchaToken || "";
  const emailRedirectTo = body.emailRedirectTo;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const captcha = await verifyTurnstileToken(captchaToken, ip);
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  const supabase = createStatelessAuthClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, needsEmailConfirmation: !data.session });

  if (data.session) {
    setAuthSessionCookies(
      response,
      data.session.access_token,
      data.session.refresh_token,
      data.session.expires_in
    );
  }

  return response;
}
