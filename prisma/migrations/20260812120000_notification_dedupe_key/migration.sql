-- Clave de idempotencia de las notificaciones.
-- El índice único es lo que garantiza que un evento reintentado no genere dos avisos:
-- sin él, "no se duplican" dependería de que ningún camino se ejecutara dos veces.

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN "dedupeKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "notifications_dedupeKey_key" ON "notifications"("dedupeKey");
