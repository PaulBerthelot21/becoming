"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LogWeightResult = {
  error?: string;
  success?: boolean;
  updated?: boolean;
  weightKg?: number;
  date?: string;
};

type TodayWeightRecapProps = {
  action: (formData: FormData) => Promise<LogWeightResult>;
  today: string;
  currentWeight: number | null;
  startWeightKg: number | null;
  latestDate?: string | null;
  weighedToday: boolean;
  todayWeight: number | null;
  defaultWeight?: number | null;
};

export function TodayWeightRecap({
  action,
  today,
  currentWeight,
  startWeightKg,
  latestDate,
  weighedToday,
  todayWeight,
  defaultWeight,
}: TodayWeightRecapProps) {
  const reduceMotion = useReducedMotion();
  const [pending, startTransition] = useTransition();
  const [doneToday, setDoneToday] = useState(weighedToday);
  const [displayWeight, setDisplayWeight] = useState<number | null>(
    todayWeight ?? currentWeight,
  );

  const lostKg =
    displayWeight != null && startWeightKg != null
      ? Number((startWeightKg - displayWeight).toFixed(1))
      : null;

  const lostLabel =
    lostKg == null
      ? "—"
      : lostKg > 0
        ? `−${lostKg.toFixed(1)} kg`
        : lostKg < 0
          ? `+${Math.abs(lostKg).toFixed(1)} kg`
          : "0 kg";

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      id="pesee"
      className="glass-strong relative overflow-hidden rounded-3xl px-4 py-5 md:px-6 md:py-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-0 size-48 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-10 size-44 rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Poids
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
              {displayWeight != null ? `${displayWeight.toFixed(1)}` : "—"}
              <span className="ml-1.5 text-lg font-medium text-muted-foreground md:text-xl">
                kg
              </span>
            </p>
            {latestDate && !doneToday ? (
              <p className="mt-1.5 text-xs text-muted-foreground">Dernière pesée · {latestDate}</p>
            ) : doneToday ? (
              <p className="mt-1.5 text-xs text-primary">Pesée du jour enregistrée</p>
            ) : null}
          </div>

          <div className="min-w-[7.5rem] rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 text-right backdrop-blur-md">
            <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              Depuis le départ
            </p>
            <p
              className={cn(
                "mt-1 text-xl font-semibold tabular-nums tracking-tight",
                lostKg != null && lostKg > 0 && "text-primary",
                lostKg != null && lostKg < 0 && "text-amber-600 dark:text-amber-300",
              )}
            >
              {lostLabel}
            </p>
            {startWeightKg != null ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Départ {startWeightKg.toFixed(1)} kg
              </p>
            ) : (
              <Link
                href="/goal"
                className="mt-1 inline-block text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Définir l&apos;objectif
              </Link>
            )}
          </div>
        </div>

        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          action={(formData) => {
            formData.set("date", today);
            startTransition(async () => {
              const result = await action(formData);
              if (result.error) {
                toast.error(result.error);
                return;
              }

              setDoneToday(true);
              if (result.weightKg != null) setDisplayWeight(result.weightKg);
              toast.success(
                result.updated
                  ? `Pesée mise à jour · ${result.weightKg?.toFixed(1)} kg`
                  : `Pesée enregistrée · ${result.weightKg?.toFixed(1)} kg`,
              );
            });
          }}
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <label htmlFor="today-weightKg" className="text-xs text-muted-foreground">
              {doneToday ? "Corriger la pesée du jour" : "Pesée du jour"}
            </label>
            <Input
              id="today-weightKg"
              name="weightKg"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={30}
              max={400}
              required
              defaultValue={defaultWeight ?? ""}
              placeholder="78.4"
              className="h-12 rounded-xl border-white/10 bg-background/40 text-base backdrop-blur-md md:h-11 dark:bg-black/25"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="h-12 shrink-0 rounded-xl px-6 shadow-[inset_0_1px_0_oklch(1_0_0_/_20%)] md:h-11"
          >
            {pending ? "…" : doneToday ? "Mettre à jour" : "Logger"}
          </Button>
        </form>
      </div>
    </motion.section>
  );
}
