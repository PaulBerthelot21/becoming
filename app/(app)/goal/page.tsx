import { requireWhitelistedSession } from "@/lib/session";
import { getWeightDashboard, upsertWeightGoal } from "@/lib/weight/actions";
import { WeightGoalForm } from "@/components/weight/weight-goal-form";

export default async function GoalPage() {
  const session = await requireWhitelistedSession();
  const weight = await getWeightDashboard(session.user.id);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Objectif</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Poids de départ, cible et rythme hebdo. À ajuster rarement.
        </p>
      </div>

      <WeightGoalForm action={upsertWeightGoal} defaults={weight.goal} />

      {weight.goal ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Cible actuelle : {weight.goal.targetWeightKg.toFixed(1)} kg à −
          {weight.goal.weeklyRateKg.toFixed(1)} kg/semaine.
        </p>
      ) : null}
    </>
  );
}
