-- TK-096 (US-025): WarehouseStock pasa de una única ubicación string a una relación
-- por sub-sector (`storageLocationId` FK -> StorageLocation, ON DELETE RESTRICT).
-- Las existencias de la antigua `MAIN_WAREHOUSE` (y cualquier valor legado) se
-- re-apuntan al sector semilla `loc-seed-unclassified`.

-- 1. Sector semilla "Bodega Principal – Sin clasificar"
INSERT INTO "StorageLocation" ("id", "name", "type", "description", "isActive", "createdAt", "updatedAt")
VALUES (
  'loc-seed-unclassified',
  'Bodega Principal – Sin clasificar',
  'WAREHOUSE',
  'Sector por defecto para existencias migradas desde MAIN_WAREHOUSE',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- 2. Nueva columna nullable
ALTER TABLE "WarehouseStock" ADD COLUMN "storageLocationId" TEXT;

-- 3. Backfill: mapea el nombre de la ubicación legada a un sector existente;
--    si no hay coincidencia, cae al sector "sin clasificar".
UPDATE "WarehouseStock" ws
SET "storageLocationId" = COALESCE(
  (SELECT sl."id" FROM "StorageLocation" sl WHERE sl."name" = ws."location" LIMIT 1),
  'loc-seed-unclassified'
);

-- 4. NOT NULL
ALTER TABLE "WarehouseStock" ALTER COLUMN "storageLocationId" SET NOT NULL;

-- 5. Restricciones e índices
CREATE UNIQUE INDEX "WarehouseStock_insumoId_storageLocationId_key" ON "WarehouseStock"("insumoId", "storageLocationId");
CREATE INDEX "WarehouseStock_storageLocationId_idx" ON "WarehouseStock"("storageLocationId");
ALTER TABLE "WarehouseStock" ADD CONSTRAINT "WarehouseStock_storageLocationId_fkey"
  FOREIGN KEY ("storageLocationId") REFERENCES "StorageLocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Baja de la columna legada
ALTER TABLE "WarehouseStock" DROP COLUMN "location";
