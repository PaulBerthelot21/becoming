"use client";

import { useTransition } from "react";

type CreateHabitFormProps = {
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
};

export function CreateHabitForm({ action }: CreateHabitFormProps) {
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
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nouvelle habitude
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={80}
          placeholder="Ex. Lire 20 minutes"
          className="h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description (optionnel)
        </label>
        <input
          id="description"
          name="description"
          maxLength={280}
          placeholder="Pourquoi cette habitude compte"
          className="h-10 w-full rounded-md border border-zinc-200 bg-transparent px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-800"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Ajout…" : "Ajouter"}
      </button>
    </form>
  );
}
