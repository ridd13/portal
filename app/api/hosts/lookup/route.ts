import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");
  return apiKey === process.env.EVENT_IMPORT_API_KEY;
}

export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = request.nextUrl.searchParams.get("telegram_username");
  if (!username) {
    return NextResponse.json(
      { error: "Missing telegram_username" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();

  const { data: host } = await supabase
    .from("hosts")
    .select("id, name, slug")
    .eq("telegram_username", username.toLowerCase().replace("@", ""))
    .single();

  if (!host) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, host });
}
