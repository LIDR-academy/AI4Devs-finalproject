-- DropForeignKey
ALTER TABLE "ConsumptionEvent" DROP CONSTRAINT "ConsumptionEvent_pantryItemId_fkey";

-- DropIndex
DROP INDEX "ConsumptionEvent_pantryItemId_occurredAt_idx";

-- AlterTable
ALTER TABLE "ConsumptionEvent" ADD COLUMN     "estimatedValueEur" DECIMAL(10,2),
ALTER COLUMN "pantryItemId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ConsumptionEvent_userId_type_idx" ON "ConsumptionEvent"("userId", "type");

-- AddForeignKey
ALTER TABLE "ConsumptionEvent" ADD CONSTRAINT "ConsumptionEvent_pantryItemId_fkey" FOREIGN KEY ("pantryItemId") REFERENCES "PantryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
