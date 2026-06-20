-- AlterTable
ALTER TABLE "ConsumptionEvent" ADD COLUMN     "itemExpirationDate" TIMESTAMP(3),
ADD COLUMN     "itemPricePaid" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "PantryItem" ADD COLUMN     "notes" TEXT;
