"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";

const links = [
  { href: "/", label: "Aujourd'hui" },
  { href: "/progress", label: "Progression" },
  { href: "/habits", label: "Leviers" },
  { href: "/goal", label: "Objectif" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-tight">Becoming</p>
          <nav className="mt-2 flex flex-wrap gap-1" aria-label="Principal">
            {links.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-2.5 py-1.5 text-sm transition ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
