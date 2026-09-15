import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";
import { AddMealProvider, RegisterAddMeal } from "@/components/food/add-meal-provider";
import { PageMotion } from "@/components/page-motion";
import { Toaster } from "@/components/ui/sonner";
import { createFoodEntry, createFoodFromFavorite, listFoodFavorites } from "@/lib/food/actions";
import { estimateFoodMacrosFromImage } from "@/lib/ai/food-macros";
import { startOfUtcDay, toDateKey } from "@/lib/date";
import { requireWhitelistedSession } from "@/lib/session";

function defaultMealTypeForNow(): "breakfast" | "lunch" | "dinner" | "snack" {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireWhitelistedSession();
  const today = toDateKey(startOfUtcDay());
  const favorites = await listFoodFavorites(session.user.id);
  const photosEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  return (
    <AddMealProvider>
      <RegisterAddMeal
        today={today}
        photosEnabled={photosEnabled}
        favorites={favorites}
        createAction={createFoodEntry}
        createFromFavoriteAction={createFoodFromFavorite}
        estimateMacrosAction={estimateFoodMacrosFromImage}
        defaultMealType={defaultMealTypeForNow()}
      />
      <AppNav user={{ name: session.user.name, image: session.user.image }} />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8 pb-[calc(8.25rem+env(safe-area-inset-bottom))] md:pb-8">
        <PageMotion>{children}</PageMotion>
      </div>
      <Toaster richColors closeButton position="top-center" />
    </AddMealProvider>
  );
}
