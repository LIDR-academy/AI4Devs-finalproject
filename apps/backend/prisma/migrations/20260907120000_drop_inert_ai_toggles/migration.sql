-- TK-129 / AUDIT-DEV-012 L-3: replenishmentOn y anomalyAuditOn eran toggles inertes
-- (ningún caso de uso los leía). Se eliminan hasta que exista la funcionalidad.
ALTER TABLE "ai_configurations" DROP COLUMN "replenishmentOn";
ALTER TABLE "ai_configurations" DROP COLUMN "anomalyAuditOn";
