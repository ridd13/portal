"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_NAV = [
  { href: "/konto", label: "Übersicht" },
  { href: "/konto/anmeldungen", label: "Anmeldungen" },
  { href: "/konto/profil", label: "Profil" },
];

const ADMIN_ONLY_NAV = [{ href: "/konto/mcp-tokens", label: "MCP Tokens" }];

export function KontoNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? [...BASE_NAV, ...ADMIN_ONLY_NAV] : BASE_NAV;

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl bg-bg-secondary p-1">
      {items.map(({ href, label }) => {
        const isActive =
          href === "/konto" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-bg-card text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
