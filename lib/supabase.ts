import { createClient } from "@supabase/supabase-js";
import { createBrowserClient as createSupabaseSSRBrowserClient } from "@supabase/ssr";

let serverClient: ReturnType<typeof createClient> | null = null;

const getSupabaseEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return { url, key };
};

export const getSupabaseServerClient = () => {
  if (serverClient) return serverClient;
  const { url, key } = getSupabaseEnv();
  serverClient = createClient(url, key);
  return serverClient;
};

// Uses @supabase/ssr so sessions are stored in cookies (not localStorage).
// This keeps the middleware's cookie-based auth check in sync with session refreshes.
export const createBrowserClient = () => {
  const { url, key } = getSupabaseEnv();
  return createSupabaseSSRBrowserClient(url, key);
};

export const createStatelessAuthClient = () => {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
