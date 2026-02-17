"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

export function LogoutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [isLoading, setIsLoading] = useState(false);

  const onSignOut = async () => {
    setIsLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    await supabase.auth.signOut();
    setIsLoading(false);
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={isLoading}
      className="rounded-full border border-border px-4 py-2 text-text-secondary transition hover:bg-bg-secondary hover:text-text-primary disabled:opacity-70"
    >
      {isLoading ? "..." : "Abmelden"}
    </button>
  );
}
