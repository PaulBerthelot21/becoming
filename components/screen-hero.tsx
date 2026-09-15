"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type ScreenHeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ScreenHero({ eyebrow, title, subtitle, children, className }: ScreenHeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass relative overflow-hidden rounded-3xl px-4 py-4 md:px-6 md:py-5",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-8 size-40 rounded-full bg-white/5 blur-3xl"
      />
      <div className="relative">
        <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {subtitle ? <div className="mt-1.5 text-sm text-muted-foreground">{subtitle}</div> : null}
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </motion.header>
  );
}
