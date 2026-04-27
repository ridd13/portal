import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { KontoNav } from "@/components/KontoNav";

export default async function KontoLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    redirect("/auth?next=/konto");
  }

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) {
    redirect("/auth?next=/konto");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold text-text-primary">Mein Bereich</h1>
        <Link
          href="/api/auth/logout"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary"
        >
          Abmelden
        </Link>
      </div>

      <KontoNav isAdmin={user.email === "lb@justclose.de"} />

      {children}
    </div>
  );
}
