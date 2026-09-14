-- CreateTable
CREATE TABLE "weight_goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startWeightKg" DOUBLE PRECISION NOT NULL,
    "targetWeightKg" DOUBLE PRECISION NOT NULL,
    "weeklyRateKg" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weight_goal_userId_key" ON "weight_goal"("userId");

-- CreateIndex
CREATE INDEX "weight_entry_userId_date_idx" ON "weight_entry"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "weight_entry_userId_date_key" ON "weight_entry"("userId", "date");

-- AddForeignKey
ALTER TABLE "weight_goal" ADD CONSTRAINT "weight_goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_entry" ADD CONSTRAINT "weight_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
