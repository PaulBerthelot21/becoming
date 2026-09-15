-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- CreateTable
CREATE TABLE "food_entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealType" "MealType" NOT NULL DEFAULT 'snack',
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "calories" INTEGER,
    "proteinG" DOUBLE PRECISION,
    "carbsG" DOUBLE PRECISION,
    "fatG" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_entry_userId_date_idx" ON "food_entry"("userId", "date");

-- AddForeignKey
ALTER TABLE "food_entry" ADD CONSTRAINT "food_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
