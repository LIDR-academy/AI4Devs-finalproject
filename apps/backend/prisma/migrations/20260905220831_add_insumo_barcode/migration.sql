-- AlterTable
ALTER TABLE "Insumo" ADD COLUMN     "barcode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Insumo_barcode_key" ON "Insumo"("barcode");
