import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";

export default async function KontoPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    redirect("/auth?mode=login&next=/konto");
  }

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) {
    redirect("/auth?mode=login&next=/konto");
  }

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-border bg-bg-card p-6 shadow-[0_8px_24px_rgba(44,36,24,0.07)] sm:p-8">
      <h1 className="text-3xl font-semibold text-text-primary">Mein Konto</h1>
      <p className="mt-2 text-text-secondary">
        Du bist angemeldet und kannst hier künftig Buchungen und Favoriten sehen.
      </p>

      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-text-muted">E-Mail</dt>
          <dd className="text-text-primary">{user.email || "nicht verfügbar"}</dd>
        </div>
        <div>
          <dt className="text-text-muted">User ID</dt>
          <dd className="break-all text-text-primary">{user.id}</dd>
        </div>
      </dl>

      <Link
        href="/"
        className="mt-6 inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:bg-bg-secondary"
      >
        Zurück zu Events
      </Link>
    </section>
  );
}
