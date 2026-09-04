-- US-029 / ADR-003 / TK-105: umbral (%) de merma de preparación destacado en el
-- reporte de mermas. Puramente aditiva — columna con DEFAULT 5, sin backfill
-- destructivo, sin DROP.

-- AlterTable
ALTER TABLE "SystemSettings" ADD COLUMN     "preparationWasteAlertPercent" INTEGER NOT NULL DEFAULT 5;
