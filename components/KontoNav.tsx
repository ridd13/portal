"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/konto", label: "Übersicht" },
  { href: "/konto/anmeldungen", label: "Anmeldungen" },
  { href: "/konto/profil", label: "Profil" },
  { href: "/konto/mcp-tokens", label: "MCP Tokens" },
];

export function KontoNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl bg-bg-secondary p-1">
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive = pathname === href;
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
