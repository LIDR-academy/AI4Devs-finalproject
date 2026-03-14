-- Rollback para migración CreateAuditLogsTable
-- Ejecutar solo si es necesario revertir manualmente
-- Fecha: 2026-01-20
-- Migración: 1769055138000-CreateAuditLogsTable

-- Eliminar foreign key
ALTER TABLE audit_logs DROP FOREIGN KEY IF EXISTS FK_audit_logs_userId;

-- Eliminar índices
DROP INDEX IF EXISTS IDX_AUDIT_LOGS_ACTION_TIMESTAMP ON audit_logs;
DROP INDEX IF EXISTS IDX_AUDIT_LOGS_TIMESTAMP ON audit_logs;
DROP INDEX IF EXISTS IDX_AUDIT_LOGS_ENTITY ON audit_logs;
DROP INDEX IF EXISTS IDX_AUDIT_LOGS_USER_ID ON audit_logs;

-- Eliminar tabla
DROP TABLE IF EXISTS audit_logs;
