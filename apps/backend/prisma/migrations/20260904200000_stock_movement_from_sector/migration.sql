-- AUDIT-DEV-006 F-7 / TK-101: el movimiento de extracción/descarte directo guardaba
-- `fromLoc = sector.name` (el NOMBRE del sub-sector), no su id — renombrar un
-- `StorageLocation` desincroniza el histórico y rompe cualquier filtrado por id.
-- Migración ADITIVA — `fromStorageLocationId` es nullable (los movimientos históricos
-- previos a esta migración, y los que nunca tuvieron sub-sector de bodega de origen
-- como RESTOCK/CONSUMPTION/SHIFT_RECONCILIATION_VARIANCE, quedan sin FK, solo con el
-- `fromLoc` de texto ya existente) y `ON DELETE SET NULL`: un sub-sector no puede
-- borrarse mientras tenga existencias (Invariante 1-bis), pero si llegara a borrarse
-- una vez vaciado, el movimiento histórico sobrevive sin la referencia.

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "fromStorageLocationId" TEXT;

-- CreateIndex
CREATE INDEX "StockMovement_fromStorageLocationId_idx" ON "StockMovement"("fromStorageLocationId");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_fromStorageLocationId_fkey" FOREIGN KEY ("fromStorageLocationId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
