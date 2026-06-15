-- AlterEnum
ALTER TYPE "ReceiptProcessingStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "householdId" TEXT;

-- AlterTable
ALTER TABLE "ReceiptItem" ADD COLUMN     "normalizedName" TEXT NOT NULL DEFAULT '';

-- Backfill normalizedName from existing rawName values for pre-existing rows
UPDATE "ReceiptItem" SET "normalizedName" = "rawName" WHERE "normalizedName" = '';

-- CreateIndex
CREATE INDEX "Receipt_householdId_createdAt_idx" ON "Receipt"("householdId", "createdAt");
