import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?confirmed=invalid", request.url));
  }

  const supabase = getSupabaseServerClient();

  // Token suchen und bestätigen
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("waitlist") as any)
    .update({ confirmed: true, confirmed_at: new Date().toISOString() })
    .eq("confirmation_token", token)
    .eq("confirmed", false)
    .select("email")
    .single();

  if (error || !data) {
    // Token ungültig oder bereits bestätigt
    return NextResponse.redirect(new URL("/?confirmed=already", request.url));
  }

  // Erfolg → Redirect zur Landing Page mit Bestätigung
  return NextResponse.redirect(new URL("/?confirmed=success", request.url));
}
