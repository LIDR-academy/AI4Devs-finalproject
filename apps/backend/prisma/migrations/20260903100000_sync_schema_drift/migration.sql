-- TK-094 (AUDIT-DEV-005 D-6): saneamiento de drift `prisma/migrations/` ↔ `schema.prisma`.
-- Dos columnas se añadieron al schema sin migración porque el stack real despliega con
-- `prisma db push` (no `migrate deploy`) y no lo notaba; `migrate deploy` sobre una base
-- limpia dejaba estas columnas fuera → P2022 ColumnNotFound y `check_seed_idempotency.sh`
-- en rojo.
--
--  * `User.mustChangePin`            — Guard 36 / rotación estricta de PIN en primer login (TK-070)
--  * `SystemSettings.idleTimeoutMinutes` — Guard 37 / cierre de sesión por inactividad táctil (TK-071)

ALTER TABLE "User" ADD COLUMN "mustChangePin" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "SystemSettings" ADD COLUMN "idleTimeoutMinutes" INTEGER NOT NULL DEFAULT 15;
