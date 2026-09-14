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

export default async function HabitsPage() {
  const session = await requireWhitelistedSession();
  const habits = await getHabitsForUser(session.user.id);

  const habitsWithStreak = await Promise.all(
    habits.map(async (habit) => ({
      ...habit,
      streak: await getHabitStreak(habit.id, session.user.id),
    })),
  );

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leviers</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Crée et gère ce que tu coches chaque jour (marche, protéines, sport…).
        </p>
      </div>

      <CreateHabitForm action={createHabit} />

      <HabitList
        habits={habitsWithStreak}
        toggleAction={toggleHabitCompletion}
        deleteAction={deleteHabit}
        mode="manage"
      />
    </>
  );
}
