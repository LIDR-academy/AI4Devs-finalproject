-- US-028 / TK-104 / ADR-003 #6: marca "intacto" del remanente. Puramente aditiva —
-- columna con DEFAULT true, sin backfill destructivo. Los remanentes existentes quedan
-- marcados como intactos; el primer consumeQuantity los pasa a false (comportamiento del
-- dominio). No hay pérdida de datos ni DROP.

-- AlterTable
ALTER TABLE "Remanente" ADD COLUMN     "isPristine" BOOLEAN NOT NULL DEFAULT true;
