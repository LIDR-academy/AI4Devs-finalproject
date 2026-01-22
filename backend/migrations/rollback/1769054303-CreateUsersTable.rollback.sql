-- Rollback para migración CreateUsersTable
-- Ejecutar solo si es necesario revertir manualmente
-- Fecha: 2026-01-20
-- Migración: 1769054303-CreateUsersTable

-- Eliminar índices
DROP INDEX IF EXISTS IDX_USERS_ROLE ON USERS;
DROP INDEX IF EXISTS IDX_USERS_EMAIL ON USERS;

-- Eliminar tabla
DROP TABLE IF EXISTS USERS;
