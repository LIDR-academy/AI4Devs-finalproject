-- Configurar las opciones SET correctas
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Script para crear la tabla Empleados si no existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Empleados' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE [dbo].[Empleados] (
        [empleadoId] INT PRIMARY KEY IDENTITY(1,1),
        [empleadoNombre] NVARCHAR(150) NOT NULL,
        [empleadoApellidos] NVARCHAR(300) NOT NULL,
        [empleadoFechaNacimiento] DATETIME NULL,
        [empleadoEmail] NVARCHAR(150) NOT NULL,
        [empleadoTelefono] NVARCHAR(15) NOT NULL,
        [empleadoMovil] NVARCHAR(15) NOT NULL,
        [puestoId] INT NULL,
        [empleadoActivo] BIT NOT NULL DEFAULT 0,
        [objetoId] INT NOT NULL DEFAULT 6,
        [empleadoGenero] INT NOT NULL DEFAULT 0,
        [empleadoFechaIngreso] DATETIME NULL,
        [empleadoLicencia] BIT NOT NULL DEFAULT 0,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NULL
    );

    PRINT 'Tabla Empleados creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla Empleados ya existe';
END
GO

-- Verificar si existe la tabla Objetos para crear la relación
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Objetos' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Verificar si ya existe la restricción de clave foránea
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Empleados_Objetos')
    BEGIN
        ALTER TABLE [dbo].[Empleados]
        ADD CONSTRAINT [FK_Empleados_Objetos] FOREIGN KEY ([objetoId]) 
        REFERENCES [dbo].[Objetos] ([objetoId]);
        
        PRINT 'Relación entre Empleados y Objetos creada correctamente';
    END
    ELSE
    BEGIN
        PRINT 'La relación entre Empleados y Objetos ya existe';
    END
END
ELSE
BEGIN
    PRINT 'La tabla Objetos no existe, no se puede crear la relación';
END
GO

-- Verificar si existe la tabla Puestos para crear la relación
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Puestos' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Verificar si ya existe la restricción de clave foránea
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Empleados_Puestos')
    BEGIN
        ALTER TABLE [dbo].[Empleados]
        ADD CONSTRAINT [FK_Empleados_Puestos] FOREIGN KEY ([puestoId]) 
        REFERENCES [dbo].[Puestos] ([puestoId]);
        
        PRINT 'Relación entre Empleados y Puestos creada correctamente';
    END
    ELSE
    BEGIN
        PRINT 'La relación entre Empleados y Puestos ya existe';
    END
END
ELSE
BEGIN
    PRINT 'La tabla Puestos no existe, no se puede crear la relación';
END
GO

-- Actualizar la relación entre Usuarios y Empleados
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios' AND schema_id = SCHEMA_ID('dbo')) 
AND EXISTS (SELECT * FROM sys.tables WHERE name = 'Empleados' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Verificar si ya existe la restricción de clave foránea
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Usuarios_Empleados')
    BEGIN
        ALTER TABLE [dbo].[Usuarios]
        ADD CONSTRAINT [FK_Usuarios_Empleados] FOREIGN KEY ([empleadoId]) 
        REFERENCES [dbo].[Empleados] ([empleadoId]);
        
        PRINT 'Relación entre Usuarios y Empleados creada correctamente';
    END
    ELSE
    BEGIN
        PRINT 'La relación entre Usuarios y Empleados ya existe';
    END
END
ELSE
BEGIN
    PRINT 'No se pueden crear las relaciones porque alguna de las tablas no existe';
END
GO
