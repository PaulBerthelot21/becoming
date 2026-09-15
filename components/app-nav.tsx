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
      <header className="glass sticky top-0 z-40 border-b-0 border-white/10 pt-[env(safe-area-inset-top)] md:static md:border-0 md:bg-transparent md:pt-0 md:shadow-none md:backdrop-filter-none">
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
                      "rounded-lg px-2.5 py-1.5 text-sm transition",
                      active
                        ? "bg-primary text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0_/_18%)]"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
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
        className="glass fixed inset-x-0 bottom-0 z-40 border-t-0 border-white/10 md:hidden"
        aria-label="Navigation mobile"
      >
        <ul className="mx-auto grid max-w-5xl grid-cols-5 items-center px-1 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
          {left.map((link) => {
            const active = isActive(pathname, link.href);
            const Icon = link.icon;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[10px] transition",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                  <span className="leading-none">{link.label}</span>
                </Link>
              </li>
            );
          })}

          <li className="flex justify-center self-stretch pt-0.5 pb-0.5">
            <motion.button
              type="button"
              aria-label="Ajouter un repas"
              disabled={!available}
              initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={available && !reduceMotion ? { scale: 0.94 } : undefined}
              onClick={() => available && setOpen(true)}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_24px_oklch(0.7_0.1_165_/_35%),inset_0_1px_0_oklch(1_0_0_/_25%)]",
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
                    "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-[10px] transition",
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
