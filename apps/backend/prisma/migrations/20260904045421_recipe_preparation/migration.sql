-- US-027 / US-028 / ADR-003: agregado RecipePreparation (+ item para TK-104) y FK
-- Remanente.recipePreparationId. Migración autogenerada, puramente aditiva.

-- CreateEnum
CREATE TYPE "RecipePreparationStatus" AS ENUM ('OPEN', 'CLOSED', 'ABANDONED');

-- AlterTable
ALTER TABLE "Remanente" ADD COLUMN     "recipePreparationId" TEXT;

-- CreateTable
CREATE TABLE "RecipePreparation" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "plannedPortions" INTEGER NOT NULL,
    "status" "RecipePreparationStatus" NOT NULL DEFAULT 'OPEN',
    "openedByOperatorId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualPortions" INTEGER,
    "closedByOperatorId" TEXT,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipePreparation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipePreparationItem" (
    "id" TEXT NOT NULL,
    "preparationId" TEXT NOT NULL,
    "insumoId" TEXT NOT NULL,
    "extractedQty" DECIMAL(12,4) NOT NULL,
    "consumedQty" DECIMAL(12,4) NOT NULL,
    "leftoverQty" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "leftoverLocationId" TEXT,
    "leftoverRemanenteId" TEXT,
    "wastedQty" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "wasteReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipePreparationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipePreparation_status_idx" ON "RecipePreparation"("status");

-- CreateIndex
CREATE INDEX "RecipePreparation_recipeId_idx" ON "RecipePreparation"("recipeId");

-- CreateIndex
CREATE INDEX "RecipePreparationItem_preparationId_idx" ON "RecipePreparationItem"("preparationId");

-- CreateIndex
CREATE INDEX "Remanente_recipePreparationId_idx" ON "Remanente"("recipePreparationId");

-- AddForeignKey
ALTER TABLE "Remanente" ADD CONSTRAINT "Remanente_recipePreparationId_fkey" FOREIGN KEY ("recipePreparationId") REFERENCES "RecipePreparation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipePreparation" ADD CONSTRAINT "RecipePreparation_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipePreparationItem" ADD CONSTRAINT "RecipePreparationItem_preparationId_fkey" FOREIGN KEY ("preparationId") REFERENCES "RecipePreparation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
