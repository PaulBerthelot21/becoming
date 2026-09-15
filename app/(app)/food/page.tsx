import Link from "next/link";
import {
  addFavoriteFromEntry,
  copyFoodDay,
  createFoodEntry,
  createFoodFromFavorite,
  deleteFoodEntry,
  getFoodDay,
  getFoodWeek,
  listFoodFavorites,
  removeFavorite,
  updateFoodEntry,
} from "@/lib/food/actions";
import { estimateFoodMacrosFromImage } from "@/lib/ai/food-macros";
import { shiftDateKey, startOfUtcDay, toDateKey } from "@/lib/date";
import { requireWhitelistedSession } from "@/lib/session";
import { FoodDayList } from "@/components/food/food-day-list";
import { FoodDaySummary } from "@/components/food/food-day-summary";
import { FoodPageHeader } from "@/components/food/food-page-header";
import { FoodQuickActions } from "@/components/food/food-quick-actions";
import { FoodWeekStrip } from "@/components/food/food-week-strip";
import { LogFoodForm } from "@/components/food/log-food-form";

function defaultMealTypeForNow(): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

type FoodPageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function FoodPage({ searchParams }: FoodPageProps) {
  const session = await requireWhitelistedSession();
  const params = await searchParams;
  const today = toDateKey(startOfUtcDay());
  const selectedDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today;

  const [food, week, favorites] = await Promise.all([
    getFoodDay(session.user.id, selectedDate),
    getFoodWeek(session.user.id, selectedDate),
    listFoodFavorites(session.user.id),
  ]);

  const photosEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const prev = shiftDateKey(selectedDate, -1);
  const next = shiftDateKey(selectedDate, 1);

  return (
    <div className="space-y-6 md:space-y-8">
      <FoodPageHeader selectedDate={selectedDate} today={today} prev={prev} next={next} />

      <FoodWeekStrip days={week.days} selectedDate={selectedDate} />

      <FoodDaySummary totals={food.totals} goal={food.goal} progress={food.progress} />

      <div className="grid gap-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:items-start md:gap-10">
        <div className="space-y-5 md:sticky md:top-20">
          <FoodQuickActions
            selectedDate={selectedDate}
            favorites={favorites}
            copyAction={copyFoodDay}
            createFromFavoriteAction={createFoodFromFavorite}
            removeFavoriteAction={removeFavorite}
          />
          <LogFoodForm
            action={createFoodEntry}
            today={selectedDate}
            defaultMealType={defaultMealTypeForNow()}
            photosEnabled={photosEnabled}
            estimateMacrosAction={estimateFoodMacrosFromImage}
          />
          {!food.goal ? (
            <p className="text-center text-xs text-muted-foreground md:text-left">
              Pour des barres kcal/protéines,{" "}
              <Link href="/goal" className="underline underline-offset-2">
                définis une cible alim
              </Link>
              .
            </p>
          ) : null}
        </div>

        <FoodDayList
          byMeal={food.byMeal}
          selectedDate={selectedDate}
          photosEnabled={photosEnabled}
          deleteAction={deleteFoodEntry}
          updateAction={updateFoodEntry}
          favoriteAction={addFavoriteFromEntry}
          estimateMacrosAction={estimateFoodMacrosFromImage}
        />
      </div>
    </div>
  );
}
