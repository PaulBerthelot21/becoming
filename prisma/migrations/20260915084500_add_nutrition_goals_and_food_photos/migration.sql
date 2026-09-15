-- AlterTable
ALTER TABLE "food_entry" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "nutrition_goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calorieTarget" INTEGER NOT NULL,
    "proteinTargetG" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_goal_userId_key" ON "nutrition_goal"("userId");

-- AddForeignKey
ALTER TABLE "nutrition_goal" ADD CONSTRAINT "nutrition_goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
