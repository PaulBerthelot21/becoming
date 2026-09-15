-- CreateTable
CREATE TABLE "food_favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mealType" "MealType",
    "notes" TEXT,
    "calories" INTEGER,
    "proteinG" DOUBLE PRECISION,
    "carbsG" DOUBLE PRECISION,
    "fatG" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "food_favorite_userId_idx" ON "food_favorite"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "food_favorite_userId_name_key" ON "food_favorite"("userId", "name");

-- AddForeignKey
ALTER TABLE "food_favorite" ADD CONSTRAINT "food_favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
