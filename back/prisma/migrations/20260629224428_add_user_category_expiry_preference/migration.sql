-- CreateTable
CREATE TABLE "UserCategoryExpiryPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "deltas" DOUBLE PRECISION[],
    "averageDelta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sampleCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCategoryExpiryPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCategoryExpiryPreference_userId_idx" ON "UserCategoryExpiryPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCategoryExpiryPreference_userId_category_key" ON "UserCategoryExpiryPreference"("userId", "category");

-- AddForeignKey
ALTER TABLE "UserCategoryExpiryPreference" ADD CONSTRAINT "UserCategoryExpiryPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
