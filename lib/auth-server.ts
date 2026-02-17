import { createClient } from "@supabase/supabase-js";

const createStatelessSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

export const getUserFromAccessToken = async (accessToken: string) => {
  const supabase = createStatelessSupabaseClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  return { user: data.user ?? null, error };
};
