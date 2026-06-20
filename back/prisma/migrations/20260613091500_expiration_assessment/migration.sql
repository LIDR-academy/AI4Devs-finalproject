-- CreateEnum
CREATE TYPE "ExpirationMethod" AS ENUM ('RULE_BASED_SPAIN', 'MANUAL_OVERRIDE');

-- CreateTable
CREATE TABLE "ExpirationAssessment" (
    "id" TEXT NOT NULL,
    "pantryItemId" TEXT NOT NULL,
    "suggestedExpirationDate" TIMESTAMP(3) NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL,
    "method" "ExpirationMethod" NOT NULL,
    "userConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpirationAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpirationAssessment_pantryItemId_key" ON "ExpirationAssessment"("pantryItemId");

-- CreateIndex
CREATE INDEX "ExpirationAssessment_confirmedByUserId_idx" ON "ExpirationAssessment"("confirmedByUserId");

-- AddForeignKey
ALTER TABLE "ExpirationAssessment" ADD CONSTRAINT "ExpirationAssessment_pantryItemId_fkey" FOREIGN KEY ("pantryItemId") REFERENCES "PantryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpirationAssessment" ADD CONSTRAINT "ExpirationAssessment_confirmedByUserId_fkey" FOREIGN KEY ("confirmedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
