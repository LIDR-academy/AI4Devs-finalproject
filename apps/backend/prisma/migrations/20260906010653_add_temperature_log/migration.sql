
-- CreateEnum
CREATE TYPE "TemperatureUnitType" AS ENUM ('REFRIGERATOR', 'FREEZER');

-- CreateTable
CREATE TABLE "TemperatureLog" (
    "id" TEXT NOT NULL,
    "storageLocationId" TEXT NOT NULL,
    "unitType" "TemperatureUnitType" NOT NULL,
    "temperatureCelsius" DECIMAL(5,2) NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemperatureLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TemperatureLog_storageLocationId_idx" ON "TemperatureLog"("storageLocationId");

-- CreateIndex
CREATE INDEX "TemperatureLog_recordedAt_idx" ON "TemperatureLog"("recordedAt");

-- AddForeignKey
ALTER TABLE "TemperatureLog" ADD CONSTRAINT "TemperatureLog_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemperatureLog" ADD CONSTRAINT "TemperatureLog_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

