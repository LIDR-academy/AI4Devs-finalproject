-- AlterTable
ALTER TABLE "NotificationPreference" ADD COLUMN     "foodConsumedByOthersEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priceDropEnabled" BOOLEAN NOT NULL DEFAULT true;
