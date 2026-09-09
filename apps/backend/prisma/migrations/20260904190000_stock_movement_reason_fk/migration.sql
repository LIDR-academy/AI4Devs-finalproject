-- ADR-004 / US-004 / TK-108: motivo estructurado del catálogo `ConsumptionReason`
-- en cada movimiento de consumo. Migración ADITIVA — `reasonId` es nullable (los
-- movimientos históricos previos a esta migración quedan sin motivo estructurado,
-- solo con el `reason` de texto libre que ya tenían) y `ON DELETE SET NULL`: si un
-- motivo llegara a borrarse en BD (la app nunca lo hace — desactivar, nunca borrar,
-- ADR-004 §3.1), el movimiento histórico sobrevive sin la referencia, no se pierde.

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "reasonId" TEXT;

-- CreateIndex
CREATE INDEX "StockMovement_reasonId_idx" ON "StockMovement"("reasonId");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "ConsumptionReason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
