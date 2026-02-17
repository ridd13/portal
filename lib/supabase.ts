import { createClient } from "@supabase/supabase-js";

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

export const createBrowserClient = () => {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key);
};

export const createStatelessAuthClient = () => {
  const { url, key } = getSupabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};
