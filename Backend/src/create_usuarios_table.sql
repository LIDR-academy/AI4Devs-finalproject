-- Script para crear la tabla Usuarios si no existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE [dbo].[Usuarios] (
        [usuarioId] INT PRIMARY KEY IDENTITY(1,1),
        [usuarioNombre] NVARCHAR(256),
        [normalizedUserName] NVARCHAR(256),
        [usuarioEmail] NVARCHAR(256),
        [normalizedEmail] NVARCHAR(256),
        [emailConfirmed] BIT NOT NULL DEFAULT 0,
        [passwordHash] NVARCHAR(MAX),
        [securityStamp] NVARCHAR(MAX),
        [concurrencyStamp] NVARCHAR(MAX),
        [usuarioMovil] NVARCHAR(15),
        [phoneNumberConfirmed] BIT NOT NULL DEFAULT 0,
        [twoFactorEnabled] BIT NOT NULL DEFAULT 0,
        [lockoutEnd] DATETIMEOFFSET NULL,
        [lockoutEnabled] BIT NOT NULL DEFAULT 1,
        [accessFailedCount] INT NOT NULL DEFAULT 0,
        [usuarioApellidos] NVARCHAR(300) NOT NULL DEFAULT '',
        [usuarioToken] UNIQUEIDENTIFIER NULL,
        [usuarioActivo] BIT NOT NULL DEFAULT 1,
        [usuarioContrasenaRecuperacion] NVARCHAR(500) NULL,
        [perfilId] INT NOT NULL,
        [empleadoId] INT NULL,
        [objetoId] INT NOT NULL,
        [usuarioContrasena] VARBINARY(500) NULL,
        [usuarioNumero] INT NOT NULL
    );

    -- Crear índices
    CREATE INDEX [EmailIndex] ON [dbo].[Usuarios] ([normalizedEmail]);
    CREATE UNIQUE INDEX [UserNameIndex] ON [dbo].[Usuarios] ([normalizedUserName]) WHERE [normalizedUserName] IS NOT NULL;

    PRINT 'Tabla Usuarios creada correctamente';
END
ELSE
BEGIN
    PRINT 'La tabla Usuarios ya existe';
END

-- Verificar si existe la tabla Empleados para crear la relación
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Empleados' AND schema_id = SCHEMA_ID('dbo'))
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
    PRINT 'La tabla Empleados no existe, no se puede crear la relación';
END

-- Verificar si existe la tabla Perfiles para crear la relación
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Perfiles' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Verificar si ya existe la restricción de clave foránea
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Usuarios_Perfiles')
    BEGIN
        ALTER TABLE [dbo].[Usuarios]
        ADD CONSTRAINT [FK_Usuarios_Perfiles] FOREIGN KEY ([perfilId]) 
        REFERENCES [dbo].[Perfiles] ([perfilId]);
        
        PRINT 'Relación entre Usuarios y Perfiles creada correctamente';
    END
    ELSE
    BEGIN
        PRINT 'La relación entre Usuarios y Perfiles ya existe';
    END
END
ELSE
BEGIN
    PRINT 'La tabla Perfiles no existe, no se puede crear la relación';
END

-- Verificar si existe la tabla Objetos para crear la relación
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Objetos' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Verificar si ya existe la restricción de clave foránea
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Usuarios_Objetos')
    BEGIN
        ALTER TABLE [dbo].[Usuarios]
        ADD CONSTRAINT [FK_Usuarios_Objetos] FOREIGN KEY ([objetoId]) 
        REFERENCES [dbo].[Objetos] ([objetoId]);
        
        PRINT 'Relación entre Usuarios y Objetos creada correctamente';
    END
    ELSE
    BEGIN
        PRINT 'La relación entre Usuarios y Objetos ya existe';
    END
END
ELSE
BEGIN
    PRINT 'La tabla Objetos no existe, no se puede crear la relación';
END
