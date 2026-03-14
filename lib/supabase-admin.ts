import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy-initialized Supabase client with service_role key.
 * Must NOT be created at module level — env vars are not available at build time.
 */
let _client: SupabaseClient | null = null;

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
