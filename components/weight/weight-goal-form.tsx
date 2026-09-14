"use client";

import { useTransition } from "react";

type WeightGoalFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  defaults?: {
    startWeightKg: number;
    targetWeightKg: number;
    weeklyRateKg: number;
  } | null;
};

export function WeightGoalForm({ action, defaults }: WeightGoalFormProps) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
      action={(formData) => {
        startTransition(async () => {
          await action(formData);
        });
      }}
    >
      <div>
        <h2 className="text-sm font-semibold">Objectif cut</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Définis ton départ, ta cible et ton rythme hebdo.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Départ (kg)</span>
          <input
            name="startWeightKg"
            type="number"
            step="0.1"
            min={30}
            max={400}
            required
            defaultValue={defaults?.startWeightKg ?? ""}
            className="h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Cible (kg)</span>
          <input
            name="targetWeightKg"
            type="number"
            step="0.1"
            min={30}
            max={400}
            required
            defaultValue={defaults?.targetWeightKg ?? ""}
            className="h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Rythme (−kg/sem)</span>
          <input
            name="weeklyRateKg"
            type="number"
            step="0.1"
            min={0.1}
            max={2}
            defaultValue={defaults?.weeklyRateKg ?? 0.5}
            className="h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Enregistrement…" : defaults ? "Mettre à jour" : "Définir l'objectif"}
      </button>
    </form>
  );
}
