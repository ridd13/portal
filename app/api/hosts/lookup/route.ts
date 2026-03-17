import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const apiKey = authHeader?.replace("Bearer ", "");
  return apiKey === process.env.EVENT_IMPORT_API_KEY;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const username = request.nextUrl.searchParams.get("telegram_username");

  const supabase = getSupabaseAdminClient();

  // Public lookup by slug (for claim flow — only returns name)
  if (slug) {
    const { data: host } = await supabase
      .from("hosts")
      .select("name, slug")
      .eq("slug", slug)
      .single();

    if (!host) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, name: host.name, slug: host.slug });
  }

  // Protected lookup by telegram_username (for import pipeline)
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!username) {
    return NextResponse.json(
      { error: "Missing telegram_username or slug parameter" },
      { status: 400 }
    );
  }

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
