"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Goal, Home, ListChecks, UtensilsCrossed } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Aujourd'hui", short: "Jour", icon: Home },
  { href: "/food", label: "Alim.", short: "Alim.", icon: UtensilsCrossed },
  { href: "/progress", label: "Progression", short: "Prog.", icon: Activity },
  { href: "/habits", label: "Leviers", short: "Leviers", icon: ListChecks },
  { href: "/goal", label: "Objectif", short: "Obj.", icon: Goal },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur md:static md:bg-background md:pt-0">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3 md:py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">Becoming</p>
            <nav className="mt-2 hidden flex-wrap gap-1 md:flex" aria-label="Principal">
              {links.map((link) => {
                const active = isActive(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-sm transition",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {link.href === "/food" ? "Alimentation" : link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur md:hidden"
        aria-label="Navigation mobile"
      >
        <ul className="mx-auto grid max-w-5xl grid-cols-5 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            const Icon = link.icon;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[10px] transition",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                  <span className="leading-none">{link.short}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
