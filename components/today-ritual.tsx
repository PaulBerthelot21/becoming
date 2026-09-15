"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type RitualItem = {
  id: string;
  label: string;
  done: boolean;
  href: string;
  detail?: string;
};

type TodayRitualProps = {
  items: RitualItem[];
};

export function TodayRitual({ items }: TodayRitualProps) {
  const reduceMotion = useReducedMotion();
  const doneCount = items.filter((item) => item.done).length;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.32 }}
      className="space-y-3"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Rituel
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {doneCount}/{items.length} faits
          </p>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-3">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + index * 0.04, duration: 0.28 }}
          >
            <Link
              href={item.href}
              className={cn(
                "glass flex h-full min-h-[4.5rem] items-start gap-3 rounded-2xl px-3.5 py-3 transition",
                item.done
                  ? "border-primary/30 bg-primary/10"
                  : "hover:border-white/20 hover:bg-white/5",
              )}
            >
              {item.done ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{item.label}</p>
                {item.detail ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.detail}</p>
                ) : null}
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
