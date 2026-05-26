"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/configuracao", label: "Configuração" },
  { href: "/manual", label: "Modo Manual" },
  { href: "/historico", label: "Histórico" },
  { href: "/status", label: "Status" },
];

export function WireNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b-2 border-neutral-800 bg-neutral-100">
      <div className="mx-auto flex max-w-4xl flex-wrap gap-1 p-2">
        <span className="mr-4 self-center text-xs font-bold uppercase tracking-wider">
          Wireframes
        </span>
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`border-2 px-3 py-1.5 text-sm ${
                active
                  ? "border-neutral-800 bg-neutral-800 text-white"
                  : "border-neutral-800 bg-white hover:bg-neutral-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
