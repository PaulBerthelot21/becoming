import { createFoodEntry, deleteFoodEntry, getFoodDay } from "@/lib/food/actions";
import { startOfUtcDay, toDateKey } from "@/lib/date";
import { requireWhitelistedSession } from "@/lib/session";
import { FoodDayList } from "@/components/food/food-day-list";
import { LogFoodForm } from "@/components/food/log-food-form";

function defaultMealTypeForNow(): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

export default async function FoodPage() {
  const session = await requireWhitelistedSession();
  const today = toDateKey(startOfUtcDay());
  const food = await getFoodDay(session.user.id, today);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alimentation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Note ce que tu manges. Les calories / macros restent optionnelles.
        </p>
      </div>

      <LogFoodForm
        action={createFoodEntry}
        today={today}
        defaultMealType={defaultMealTypeForNow()}
      />

      <FoodDayList byMeal={food.byMeal} totals={food.totals} deleteAction={deleteFoodEntry} />
    </>
  );
}
