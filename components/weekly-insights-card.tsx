"use client";

import { motion, useReducedMotion } from "motion/react";

type WeeklyInsightsCardProps = {
  lines: string[];
  from: string;
  to: string;
};

export function WeeklyInsightsCard({ lines, from, to }: WeeklyInsightsCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
      className="rounded-2xl border border-border/70 bg-card/80 px-4 py-4 backdrop-blur md:px-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Insights
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {from} → {to}
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {lines.map((line, index) => (
          <motion.li
            key={line}
            initial={reduceMotion ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + index * 0.03, duration: 0.25 }}
            className="rounded-xl bg-muted/50 px-3 py-2.5 text-sm leading-snug"
          >
            {line}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
