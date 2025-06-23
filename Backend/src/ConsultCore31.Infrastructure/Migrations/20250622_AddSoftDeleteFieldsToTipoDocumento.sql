-- Migración para agregar los campos de borrado lógico a la tabla TiposDocumento
-- Fecha: 22/06/2025

-- Verificar si la columna tipoDocumentoEliminado ya existe
IF NOT EXISTS (
    SELECT *
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TiposDocumento'
    AND COLUMN_NAME = 'tipoDocumentoEliminado'
)
BEGIN
    -- Agregar la columna tipoDocumentoEliminado
    ALTER TABLE [dbo].[TiposDocumento]
    ADD [tipoDocumentoEliminado] BIT NOT NULL DEFAULT 0;

    PRINT 'Columna tipoDocumentoEliminado agregada correctamente.';
END
ELSE
BEGIN
    PRINT 'La columna tipoDocumentoEliminado ya existe.';
END

-- Verificar si la columna fechaEliminacion ya existe
IF NOT EXISTS (
    SELECT *
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TiposDocumento'
    AND COLUMN_NAME = 'fechaEliminacion'
)
BEGIN
    -- Agregar la columna fechaEliminacion
    ALTER TABLE [dbo].[TiposDocumento]
    ADD [fechaEliminacion] DATETIME NULL;

    PRINT 'Columna fechaEliminacion agregada correctamente.';
END
ELSE
BEGIN
    PRINT 'La columna fechaEliminacion ya existe.';
END

-- Actualizar los registros existentes para asegurar que el campo tipoDocumentoEliminado sea false
UPDATE [dbo].[TiposDocumento]
SET [tipoDocumentoEliminado] = 0
WHERE [tipoDocumentoEliminado] IS NULL;

PRINT 'Migración completada correctamente.';
