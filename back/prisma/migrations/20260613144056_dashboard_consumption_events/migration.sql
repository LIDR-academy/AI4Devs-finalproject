-- CreateEnum
CREATE TYPE "ConsumptionEventType" AS ENUM ('CONSUMED', 'WASTED');

-- CreateTable
CREATE TABLE "ConsumptionEvent" (
    "id" TEXT NOT NULL,
    "pantryItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ConsumptionEventType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsumptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsumptionEvent_userId_occurredAt_idx" ON "ConsumptionEvent"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "ConsumptionEvent_pantryItemId_occurredAt_idx" ON "ConsumptionEvent"("pantryItemId", "occurredAt");

-- AddForeignKey
ALTER TABLE "ConsumptionEvent" ADD CONSTRAINT "ConsumptionEvent_pantryItemId_fkey" FOREIGN KEY ("pantryItemId") REFERENCES "PantryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumptionEvent" ADD CONSTRAINT "ConsumptionEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
