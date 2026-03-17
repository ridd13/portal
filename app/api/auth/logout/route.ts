import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth-cookies";
import { getSiteUrl } from "@/lib/site-url";

function clearCookies(response: NextResponse) {
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: REFRESH_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearCookies(response);
  return response;
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const response = NextResponse.redirect(`${siteUrl}/`);
  clearCookies(response);
  return response;
}
