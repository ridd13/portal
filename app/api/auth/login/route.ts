import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { setAuthSessionCookies } from "@/lib/auth-session";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { createStatelessAuthClient } from "@/lib/supabase";

interface LoginPayload {
  email?: string;
  password?: string;
  captchaToken?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginPayload;
  const email = body.email?.trim();
  const password = body.password;
  const captchaToken = body.captchaToken || "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const captcha = await verifyTurnstileToken(captchaToken, ip);
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  const supabase = createStatelessAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    return NextResponse.json(
      { error: error?.message || "Authentication failed" },
      { status: 401 }
    );
  }

  // Build SSR-format cookies (sb-*-auth-token) so middleware's getUser() can see this session
  const ssrCookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const ssrClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: (cookies) => { ssrCookiesToSet.push(...cookies); },
      },
    }
  );
  await ssrClient.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  const response = NextResponse.json({ ok: true });
  ssrCookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });
  setAuthSessionCookies(
    response,
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in
  );
  return response;
}
