USE master;
GO

-- Crear una nueva base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ConsultCore31_Temp')
BEGIN
    CREATE DATABASE ConsultCore31_Temp;
    PRINT 'Base de datos ConsultCore31_Temp creada correctamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos ConsultCore31_Temp ya existe.';
END
GO

-- Usar la base de datos
USE ConsultCore31_Temp;
GO

-- Verificar que la base de datos se creó correctamente
SELECT name, state_desc FROM sys.databases WHERE name = 'ConsultCore31_Temp';
GO
