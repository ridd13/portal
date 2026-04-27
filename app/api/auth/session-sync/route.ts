import { NextRequest, NextResponse } from "next/server";
import { setAuthSessionCookies } from "@/lib/auth-session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { access_token, refresh_token, expires_in } = body;

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  setAuthSessionCookies(response, access_token, refresh_token, expires_in ?? 3600);
  return response;
}
