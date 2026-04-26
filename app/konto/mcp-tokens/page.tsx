import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { McpTokenList } from "./McpTokenList";

export const metadata: Metadata = {
  title: "MCP Tokens — Mein Bereich | Das Portal",
  robots: { index: false },
};

export default async function McpTokensPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) redirect("/auth?next=/konto/mcp-tokens");

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) redirect("/auth?next=/konto/mcp-tokens");

  const supabase = getSupabaseAdminClient();
  const { data: tokens, error } = await supabase
    .from("mcp_tokens")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tokens:", error);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-bg-card p-6">
        <h2 className="text-xl font-semibold text-text-primary">MCP Tokens</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Verwalte deine Tokens für den Paperclip MCP Server. Mit diesen Tokens kannst du Paperclip
          in Claude Desktop oder Claude Code einbinden.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
            Nutzung in Claude Desktop anzeigen
          </summary>
          <div className="mt-3 rounded-lg border border-border bg-bg-secondary p-4">
            <p className="mb-2 text-sm text-text-secondary">
              Füge folgendes zu deiner <code className="font-mono">claude_desktop_config.json</code> hinzu:
            </p>
            <pre className="overflow-x-auto rounded-md bg-bg-card p-3 font-mono text-xs text-text-primary">
{`{
  "mcpServers": {
    "paperclip": {
      "command": "npx",
      "args": ["@paperclipai/server", "run"],
      "env": {
        "PAPERCLIP_TOKEN": "DEIN_TOKEN_HIER"
      }
    }
  }
}`}
            </pre>
          </div>
        </details>
      </section>

      <McpTokenList initialTokens={tokens || []} userId={user.id} />
    </div>
  );
}
