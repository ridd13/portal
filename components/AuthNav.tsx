import Link from "next/link";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getUserFromAccessToken } from "@/lib/auth-server";
import { LogoutButton } from "@/components/LogoutButton";

const guestNav = (
  <>
    <Link
      href="/auth?mode=login"
      className="rounded-full px-3 py-2 transition hover:bg-bg-secondary hover:text-text-primary"
    >
      Anmelden
    </Link>
    <Link
      href="/auth?mode=signup"
      className="rounded-full border border-accent-primary px-4 py-2 text-accent-primary transition hover:bg-accent-primary hover:text-white"
    >
      Registrieren
    </Link>
  </>
);

export async function AuthNav() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) return guestNav;

  const { user } = await getUserFromAccessToken(accessToken);
  if (!user) return guestNav;

  return (
    <>
      <Link
        href="/konto"
        className="rounded-full px-3 py-2 transition hover:bg-bg-secondary hover:text-text-primary"
      >
        Konto
      </Link>
      <LogoutButton />
    </>
  );
}
