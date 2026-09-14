"use client";

import { useTransition } from "react";

type LogWeightFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  defaultWeight?: number | null;
  today: string;
};

export function LogWeightForm({ action, defaultWeight, today }: LogWeightFormProps) {
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
        <h2 className="text-sm font-semibold">Pesée</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Une mesure par jour suffit. La moyenne 7j lisse les variations d&apos;eau.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Poids (kg)</span>
          <input
            name="weightKg"
            type="number"
            step="0.1"
            min={30}
            max={400}
            required
            defaultValue={defaultWeight ?? ""}
            placeholder="78.4"
            className="h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Date</span>
          <input
            name="date"
            type="date"
            defaultValue={today}
            className="h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800"
          />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60 sm:w-auto"
          >
            {pending ? "…" : "Logger"}
          </button>
        </div>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Note (optionnel)</span>
        <input
          name="note"
          maxLength={280}
          placeholder="Ex. matin à jeun"
          className="h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800"
        />
      </label>
    </form>
  );
}
