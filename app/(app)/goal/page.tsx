import { requireWhitelistedSession } from "@/lib/session";
import { getWeightDashboard, upsertWeightGoal } from "@/lib/weight/actions";
import { getNutritionGoal, upsertNutritionGoal } from "@/lib/food/actions";
import { cleanupOrphanMealBlobs } from "@/lib/blob-cleanup";
import { importUserBackup } from "@/lib/backup";
import { WeightGoalForm } from "@/components/weight/weight-goal-form";
import { NutritionGoalForm } from "@/components/food/nutrition-goal-form";
import { DataToolsCard } from "@/components/data-tools-card";

export default async function GoalPage() {
  const session = await requireWhitelistedSession();
  const [weight, nutrition] = await Promise.all([
    getWeightDashboard(session.user.id),
    getNutritionGoal(session.user.id),
  ]);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Objectif</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cut (poids) + cibles alimentaires. À ajuster rarement.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <WeightGoalForm action={upsertWeightGoal} defaults={weight.goal} />
        <NutritionGoalForm action={upsertNutritionGoal} defaults={nutrition} />
      </div>

      {weight.goal ? (
        <p className="text-sm text-muted-foreground">
          Cible poids : {weight.goal.targetWeightKg.toFixed(1)} kg à −
          {weight.goal.weeklyRateKg.toFixed(1)} kg/semaine.
        </p>
      ) : null}

      <DataToolsCard cleanupAction={cleanupOrphanMealBlobs} importAction={importUserBackup} />
    </>
  );
}
