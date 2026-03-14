-- Rollback para migración CreateSpecialtiesTable
-- Ejecutar solo si es necesario revertir manualmente
-- Fecha: 2026-01-20
-- Migración: 1769058000000-CreateSpecialtiesTable

-- Eliminar índices
DROP INDEX IF EXISTS IDX_SPECIALTIES_IS_ACTIVE ON SPECIALTIES;

-- Eliminar tabla
DROP TABLE IF EXISTS SPECIALTIES;
