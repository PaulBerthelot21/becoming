"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateFr } from "@/lib/date";
import { cn } from "@/lib/utils";

type FoodPageHeaderProps = {
  selectedDate: string;
  today: string;
  prev: string;
  next: string;
};

export function FoodPageHeader({ selectedDate, today, prev, next }: FoodPageHeaderProps) {
  const reduceMotion = useReducedMotion();
  const isToday = selectedDate === today;
  const title = formatDateFr(selectedDate, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-background to-accent/40 px-4 py-5 md:px-6 md:py-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-8 size-40 rounded-full bg-accent/50 blur-3xl"
      />

      <div className="relative flex items-center justify-between gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl bg-background/60 backdrop-blur md:h-10 md:w-10"
        >
          <Link href={`/food?date=${prev}`} aria-label="Jour précédent">
            <ChevronLeft className="size-5" />
          </Link>
        </Button>

        <div className="min-w-0 text-center">
          <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Alimentation
          </p>
          <h1 className="mt-1 truncate text-xl font-semibold tracking-tight capitalize md:text-2xl">
            {title}
          </h1>
          <p
            className={cn(
              "mt-1 text-sm",
              isToday ? "font-medium text-primary" : "text-muted-foreground",
            )}
          >
            {isToday ? "Aujourd'hui" : selectedDate}
          </p>
        </div>

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl bg-background/60 backdrop-blur md:h-10 md:w-10"
        >
          <Link href={`/food?date=${next}`} aria-label="Jour suivant">
            <ChevronRight className="size-5" />
          </Link>
        </Button>
      </div>

      {!isToday ? (
        <div className="relative mt-4 flex justify-center">
          <Button asChild variant="secondary" size="sm" className="h-9 rounded-xl">
            <Link href="/food">Revenir à aujourd&apos;hui</Link>
          </Button>
        </div>
      ) : null}
    </motion.header>
  );
}
