import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy-initialized Supabase client with service_role key.
 * Must NOT be created at module level — env vars are not available at build time.
 */
let _client: SupabaseClient | null = null;

/**
 * Supabase ignores the `redirectTo` option in generateLink() when the URL is
 * not in the project's Redirect URLs allowlist, silently falling back to the
 * configured Site URL (often localhost in dev projects). This helper rewrites
 * any localhost redirect_to in the returned action_link to the correct prod URL,
 * acting as a safety net independent of Supabase dashboard configuration.
 */
export function patchActionLinkRedirect(
  actionLink: string,
  correctRedirectTo: string
): string {
  try {
    const url = new URL(actionLink);
    const currentRedirect = url.searchParams.get("redirect_to");
    if (
      currentRedirect &&
      new URL(currentRedirect).hostname === "localhost"
    ) {
      url.searchParams.set("redirect_to", correctRedirectTo);
    }
    return url.toString();
  } catch {
    return actionLink;
  }
}

export function getSupabaseAdminClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    _client = createClient(url, key);
  }
  return _client;
}
