-- AlterTable
ALTER TABLE "WorkOrder" ALTER COLUMN "ownerClientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN "broughtByName" TEXT;
ALTER TABLE "WorkOrder" ADD COLUMN "broughtByPhone" TEXT;
