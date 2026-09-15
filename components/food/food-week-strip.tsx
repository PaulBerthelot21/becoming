"use client";

import Link from "next/link";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { weekdayShortFr } from "@/lib/date";
import { cn } from "@/lib/utils";

type FoodWeekStripProps = {
  days: Array<{
    date: string;
    count: number;
    calories: number;
    proteinG: number;
  }>;
  selectedDate: string;
};

export function FoodWeekStrip({ days, selectedDate }: FoodWeekStripProps) {
  const reduceMotion = useReducedMotion();

  return (
    <LayoutGroup id="food-week">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="grid grid-cols-7 gap-1.5 md:gap-2"
      >
        {days.map((day) => {
          const active = day.date === selectedDate;
          const dayNum = day.date.slice(8);
          const hasEntries = day.count > 0;

          return (
            <Link
              key={day.date}
              href={`/food?date=${day.date}`}
              className={cn(
                "relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-center transition",
                active ? "text-primary-foreground" : "text-foreground hover:bg-accent/70",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={reduceMotion ? undefined : "food-week-pill"}
                  className="absolute inset-0 rounded-2xl bg-primary shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span className="relative text-[10px] font-medium tracking-wide uppercase opacity-80">
                {weekdayShortFr(day.date)}
              </span>
              <span className="relative text-sm font-semibold tabular-nums">{dayNum}</span>
              <span
                className={cn(
                  "relative size-1.5 rounded-full",
                  active
                    ? hasEntries
                      ? "bg-primary-foreground"
                      : "bg-primary-foreground/35"
                    : hasEntries
                      ? "bg-primary"
                      : "bg-transparent",
                )}
              />
            </Link>
          );
        })}
      </motion.div>
    </LayoutGroup>
  );
}
