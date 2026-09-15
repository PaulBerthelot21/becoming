"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Goal, Home, ListChecks, Plus, UtensilsCrossed } from "lucide-react";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { useAddMeal } from "@/components/food/add-meal-provider";
import { cn } from "@/lib/utils";

const desktopLinks = [
  { href: "/", label: "Aujourd'hui" },
  { href: "/food", label: "Alimentation" },
  { href: "/progress", label: "Progression" },
  { href: "/habits", label: "Leviers" },
  { href: "/goal", label: "Objectif" },
] as const;

const mobileLinks = [
  { href: "/", label: "Jour", icon: Home },
  { href: "/food", label: "Alim.", icon: UtensilsCrossed },
  { href: "/habits", label: "Leviers", icon: ListChecks },
  { href: "/goal", label: "Obj.", icon: Goal },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type AppNavProps = {
  user: {
    name: string;
    image?: string | null;
  };
};

export function AppNav({ user }: AppNavProps) {
  const pathname = usePathname();
  const { available, setOpen } = useAddMeal();
  const reduceMotion = useReducedMotion();
  const profileActive = pathname.startsWith("/profile");

  const left = mobileLinks.slice(0, 2);
  const right = mobileLinks.slice(2);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur md:static md:bg-background md:pt-0">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3 md:py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">Becoming</p>
            <nav className="mt-2 hidden flex-wrap gap-1 md:flex" aria-label="Principal">
              {desktopLinks.map((link) => {
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
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Link
            href="/profile"
            aria-label="Profil"
            aria-current={profileActive ? "page" : undefined}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full transition md:h-8 md:w-8",
              profileActive
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "hover:opacity-90",
            )}
          >
            <ProfileAvatar name={user.name} image={user.image} />
          </Link>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur md:hidden"
        aria-label="Navigation mobile"
      >
        <ul className="mx-auto grid max-w-5xl grid-cols-5 items-end px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
          {left.map((link) => {
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
                  <span className="leading-none">{link.label}</span>
                </Link>
              </li>
            );
          })}

          <li className="flex justify-center">
            <motion.button
              type="button"
              aria-label="Ajouter un repas"
              disabled={!available}
              initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={available && !reduceMotion ? { scale: 0.94 } : undefined}
              onClick={() => available && setOpen(true)}
              className={cn(
                "-mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md",
                !available && "opacity-40",
              )}
            >
              <Plus className="size-6" strokeWidth={2.5} />
            </motion.button>
          </li>

          {right.map((link) => {
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
                  <span className="leading-none">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
