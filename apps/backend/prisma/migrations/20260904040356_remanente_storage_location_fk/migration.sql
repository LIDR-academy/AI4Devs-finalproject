-- US-026 / TK-102: área de cocina del catálogo para los remanentes.
-- Migración ADITIVA — `location` (literal) se conserva como caché de display;
-- `storageLocationId` es la FK canónica (nullable: los remanentes históricos que
-- no matchean un área quedan con la FK en NULL y solo el literal en `location`).

-- AlterTable
ALTER TABLE "Remanente" ADD COLUMN     "storageLocationId" TEXT;

-- CreateIndex
CREATE INDEX "Remanente_storageLocationId_idx" ON "Remanente"("storageLocationId");

-- AddForeignKey
ALTER TABLE "Remanente" ADD CONSTRAINT "Remanente_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Áreas de cocina semilla (type = KITCHEN). Idempotente con el `upsert by name` de
-- prisma/seed.ts (mismos pares id/name). "Refrigerador Principal Cocina" puede ya
-- existir por un seed previo.
INSERT INTO "StorageLocation" ("id", "name", "type", "description", "isActive", "createdAt", "updatedAt")
VALUES
  ('loc-seed-kitchen-fridge', 'Refrigerador Principal Cocina', 'KITCHEN', 'Destino de remanentes en línea de fríos', true, NOW(), NOW()),
  ('loc-seed-kitchen-prep',   'Mesa de Preparación',           'KITCHEN', 'Mesa de trabajo / mise en place',        true, NOW(), NOW()),
  ('loc-seed-kitchen-line',   'Línea de Servicio',             'KITCHEN', 'Línea de emplatado y despacho',          true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Backfill best-effort: mapea los literales conocidos a su área semilla.
UPDATE "Remanente" SET "storageLocationId" =
  CASE "location"
    WHEN 'KITCHEN_FRIDGE' THEN 'loc-seed-kitchen-fridge'
    WHEN 'KITCHEN_PREP'   THEN 'loc-seed-kitchen-prep'
    WHEN 'KITCHEN_LINE'   THEN 'loc-seed-kitchen-line'
    ELSE NULL
  END
WHERE "storageLocationId" IS NULL;
