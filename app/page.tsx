import {
  createHabit,
  deleteHabit,
  getHabitStreak,
  getHabitsForUser,
  toggleHabitCompletion,
} from "@/lib/habits/actions";
import { requireWhitelistedSession } from "@/lib/session";
import { CreateHabitForm } from "@/components/habits/create-habit-form";
import { HabitList } from "@/components/habits/habit-list";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function Home() {
  const session = await requireWhitelistedSession();
  const habits = await getHabitsForUser(session.user.id);

  const habitsWithStreak = await Promise.all(
    habits.map(async (habit) => ({
      ...habit,
      streak: await getHabitStreak(habit.id, session.user.id),
    })),
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Becoming</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Habitudes du jour</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Connecté en tant que {session.user.email}
          </p>
        </div>
        <SignOutButton />
      </header>

      <CreateHabitForm action={createHabit} />

      <HabitList
        habits={habitsWithStreak}
        toggleAction={toggleHabitCompletion}
        deleteAction={deleteHabit}
      />
    </main>
  );
}
