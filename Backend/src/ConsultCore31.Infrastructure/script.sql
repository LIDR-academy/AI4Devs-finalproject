IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
    BEGIN
    CREATE TABLE [__EFMigrationsHistory]
    (
        [MigrationId] NVARCHAR(150) NOT NULL,
        [ProductVersion] NVARCHAR(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory]
                    PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [AspNetRoles]
    (
        [Id] INT NOT NULL IDENTITY,
        [Name] VARCHAR(256) NULL,
        [NormalizedName] VARCHAR(256) NULL,
        [ConcurrencyStamp] VARCHAR(256) NULL,
        CONSTRAINT [PK_AspNetRoles]
                    PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[CategoriasGasto]
    (
        [categoriaGastoId] INT NOT NULL IDENTITY,
        [categoriaGastoNombre] VARCHAR(256) NOT NULL,
        [categoriaGastoDescripcion] VARCHAR(256) NULL,
        [categoriaGastoEsEstandar] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [categoriaGastoRequiereComprobante] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [categoriaGastoLimiteMaximo] DECIMAL(18, 2) NULL,
        [categoriaGastoActiva] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_CategoriasGasto]
                    PRIMARY KEY ([categoriaGastoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[EstadosAprobacion]
    (
        [estadoAprobacionId] INT NOT NULL IDENTITY,
        [estadoAprobacionNombre] VARCHAR(256) NOT NULL,
        [estadoAprobacionDescripcion] VARCHAR(256) NULL,
        [estadoAprobacionColor] VARCHAR(256) NULL,
        [estadoAprobacionEsAprobado] BIT NOT NULL,
        [estadoAprobacionEsRechazado] BIT NOT NULL,
        [estadoAprobacionActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_EstadosAprobacion]
                    PRIMARY KEY ([estadoAprobacionId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[EstadosEtapa]
    (
        [estadoEtapaId] INT NOT NULL IDENTITY,
        [estadoEtapaNombre] VARCHAR(256) NOT NULL,
        [estadoEtapaDescripcion] VARCHAR(256) NULL,
        [estadoEtapaColor] VARCHAR(256) NULL,
        [estadoEtapaOrden] INT NOT NULL,
        [estadoEtapaEsFinal] BIT NOT NULL,
        [estadoEtapaActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_EstadosEtapa]
                    PRIMARY KEY ([estadoEtapaId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[EstadosProyecto]
    (
        [estadoProyectoId] INT NOT NULL IDENTITY,
        [estadoProyectoNombre] VARCHAR(256) NOT NULL,
        [estadoProyectoDescripcion] VARCHAR(256) NULL,
        [estadoProyectoColor] VARCHAR(256) NULL,
        [estadoProyectoOrden] INT NOT NULL,
        [estadoProyectoEsFinal] BIT NOT NULL,
        [estadoProyectoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_EstadosProyecto]
                    PRIMARY KEY ([estadoProyectoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[EstadosTarea]
    (
        [estadoTareaId] INT NOT NULL IDENTITY,
        [estadoTareaNombre] VARCHAR(256) NOT NULL,
        [estadoTareaDescripcion] VARCHAR(256) NULL,
        [estadoTareaColor] VARCHAR(256) NULL,
        [estadoTareaOrden] INT NOT NULL,
        [estadoTareaEsFinal] BIT NOT NULL,
        [estadoTareaActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_EstadosTarea]
                    PRIMARY KEY ([estadoTareaId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[FrecuenciasMedicion]
    (
        [frecuenciaMedicionId] INT NOT NULL IDENTITY,
        [frecuenciaMedicionNombre] VARCHAR(256) NOT NULL,
        [frecuenciaMedicionDescripcion] VARCHAR(256) NULL,
        [frecuenciaMedicionIntervaloDias] INT NOT NULL,
        [frecuenciaMedicionActiva] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_FrecuenciasMedicion]
                    PRIMARY KEY ([frecuenciaMedicionId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Menus]
    (
        [menuId] INT NOT NULL IDENTITY,
        [menuNombre] VARCHAR(256) NOT NULL,
        [descripcion] VARCHAR(256) NOT NULL,
        [icono] VARCHAR(256) NOT NULL,
        [ruta] VARCHAR(256) NOT NULL,
        [orden] INT NOT NULL,
        [menuPadreId] INT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Menus]
                    PRIMARY KEY ([menuId]),
        CONSTRAINT [FK_Menus_Menus_menuPadreId]
                    FOREIGN KEY ([menuPadreId])
                    REFERENCES [dbo].[Menus] ([menuId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Monedas]
    (
        [monedaId] INT NOT NULL IDENTITY,
        [monedaCodigo] VARCHAR(256) NOT NULL,
        [monedaNombre] VARCHAR(256) NOT NULL,
        [monedaSimbolo] VARCHAR(256) NULL,
        [monedaTasaCambio] DECIMAL(18, 6) NOT NULL,
        [monedaFechaActualizacion] DATETIME NULL,
        [monedaEsPredeterminada] BIT NOT NULL,
        [monedaActiva] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Monedas]
                    PRIMARY KEY ([monedaId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[ObjetoTipos]
    (
        [objetoTipoId] INT NOT NULL IDENTITY,
        [objetoTipoNombre] VARCHAR(256) NOT NULL,
        [objetoTipoDescripcion] VARCHAR(256) NULL,
        [objetoTipoActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_ObjetoTipos]
                    PRIMARY KEY ([objetoTipoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[PrioridadesTarea]
    (
        [prioridadTareaId] INT NOT NULL IDENTITY,
        [prioridadTareaNombre] VARCHAR(256) NOT NULL,
        [prioridadTareaDescripcion] VARCHAR(256) NULL,
        [prioridadTareaColor] VARCHAR(256) NULL,
        [prioridadTareaNivel] INT NOT NULL,
        [prioridadTareaActiva] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_PrioridadesTarea]
                    PRIMARY KEY ([prioridadTareaId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Puestos]
    (
        [puestoId] INT NOT NULL IDENTITY,
        [puestoNombre] VARCHAR(256) NOT NULL,
        [puestoDescripcion] VARCHAR(256) NULL,
        [puestoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Puestos]
                    PRIMARY KEY ([puestoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[TiposDocumento]
    (
        [tipoDocumentoId] INT NOT NULL IDENTITY,
        [tipoDocumentoNombre] VARCHAR(256) NOT NULL,
        [tipoDocumentoDescripcion] VARCHAR(256) NULL,
        [tipoDocumentoExtensionesPermitidas] VARCHAR(256) NULL,
        [tipoDocumentoTamanoMaximoMB] DECIMAL(10, 2) NULL,
        [tipoDocumentoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_TiposDocumento]
                    PRIMARY KEY ([tipoDocumentoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[TiposKpi]
    (
        [tipoKPIId] INT NOT NULL IDENTITY,
        [tipoKPINombre] VARCHAR(256) NOT NULL,
        [tipoKPIDescripcion] VARCHAR(256) NULL,
        [tipoKPIUnidad] VARCHAR(256) NULL,
        [tipoKPIFormato] VARCHAR(256) NULL,
        [tipoKPIActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_TiposKpi]
                    PRIMARY KEY ([tipoKPIId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[TiposMovimientoViatico]
    (
        [tipoMovimientoViaticoId] INT NOT NULL IDENTITY,
        [tipoMovimientoViaticoNombre] VARCHAR(256) NOT NULL,
        [tipoMovimientoViaticoDescripcion] VARCHAR(256) NULL,
        [tipoMovimientoViaticoAfectacion] INT NOT NULL,
        [tipoMovimientoViaticoRequiereComprobante] BIT NOT NULL,
        [tipoMovimientoViaticoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_TiposMovimientoViatico]
                    PRIMARY KEY ([tipoMovimientoViaticoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[TiposProyecto]
    (
        [tipoProyectoId] INT NOT NULL IDENTITY,
        [tipoProyectoNombre] VARCHAR(256) NOT NULL,
        [tipoProyectoDescripcion] VARCHAR(256) NULL,
        [tipoProyectoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_TiposProyecto]
                    PRIMARY KEY ([tipoProyectoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [AspNetRoleClaims]
    (
        [Id] INT NOT NULL IDENTITY,
        [RoleId] INT NOT NULL,
        [ClaimType] VARCHAR(256) NULL,
        [ClaimValue] VARCHAR(256) NULL,
        CONSTRAINT [PK_AspNetRoleClaims]
                    PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId]
                    FOREIGN KEY ([RoleId])
                    REFERENCES [AspNetRoles] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Objetos]
    (
        [objetoId] INT NOT NULL IDENTITY,
        [objetoNombre] VARCHAR(256) NOT NULL,
        [objetoTipoId] INT NOT NULL,
        [menuId] INT NULL,
        [objetoActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Objetos]
                    PRIMARY KEY ([objetoId]),
        CONSTRAINT [FK_Objetos_Menus_menuId]
                    FOREIGN KEY ([menuId])
                    REFERENCES [dbo].[Menus] ([menuId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Objetos_ObjetoTipos_objetoTipoId]
                    FOREIGN KEY ([objetoTipoId])
                    REFERENCES [dbo].[ObjetoTipos] ([objetoTipoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Clientes]
    (
        [clienteId] INT NOT NULL IDENTITY,
        [clienteNombre] VARCHAR(256) NOT NULL,
        [clienteNombreComercial] VARCHAR(256) NULL,
        [clienteRFC] VARCHAR(256) NULL,
        [clienteDireccion] VARCHAR(256) NULL,
        [clienteTelefono] VARCHAR(256) NULL,
        [clienteEmail] VARCHAR(256) NULL,
        [clienteSitioWeb] VARCHAR(256) NULL,
        [clienteIndustria] VARCHAR(256) NULL,
        [clienteFechaAlta] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [clienteActivo] BIT NOT NULL,
        [objetoId] INT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Clientes]
                    PRIMARY KEY ([clienteId]),
        CONSTRAINT [FK_Clientes_Objetos_objetoId]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[empleados]
    (
        [empleadoId] INT NOT NULL IDENTITY,
        [empleadoNombre] VARCHAR(256) NOT NULL
            DEFAULT '',
        [empleadoApellidos] VARCHAR(256) NOT NULL
            DEFAULT '',
        [empleadoFechaNacimiento] DATETIME NULL,
        [empleadoEmail] VARCHAR(256) NOT NULL,
        [empleadoTelefono] VARCHAR(256) NOT NULL
            DEFAULT '',
        [empleadoMovil] VARCHAR(256) NOT NULL
            DEFAULT '',
        [puestoId] INT NULL,
        [empleadoActivo] BIT NOT NULL
            DEFAULT CAST(0 AS BIT),
        [objetoId] INT NOT NULL
            DEFAULT 6,
        [empleadoGenero] INT NOT NULL
            DEFAULT 0,
        [empleadoFechaIngreso] DATETIME NULL,
        [empleadoLicencia] BIT NOT NULL
            DEFAULT CAST(0 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_empleados]
                    PRIMARY KEY ([empleadoId]),
        CONSTRAINT [FK_empleados_objetos]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_empleados_puestos]
                    FOREIGN KEY ([puestoId])
                    REFERENCES [dbo].[Puestos] ([puestoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Perfiles]
    (
        [perfilId] INT NOT NULL IDENTITY,
        [perfilNombre] VARCHAR(256) NOT NULL,
        [perfilActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [objetoId] INT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Perfiles]
                    PRIMARY KEY ([perfilId]),
        CONSTRAINT [FK_Perfiles_Objetos_objetoId]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[ContactosCliente]
    (
        [contactoId] INT NOT NULL IDENTITY,
        [clienteId] INT NOT NULL,
        [contactoNombre] VARCHAR(256) NOT NULL,
        [contactoApellidos] VARCHAR(256) NOT NULL,
        [contactoPuesto] VARCHAR(256) NULL,
        [contactoEmail] VARCHAR(256) NULL,
        [contactoTelefono] VARCHAR(256) NULL,
        [contactoMovil] VARCHAR(256) NULL,
        [contactoEsPrincipal] BIT NOT NULL,
        [contactoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_ContactosCliente]
                    PRIMARY KEY ([contactoId]),
        CONSTRAINT [FK_ContactosCliente_Clientes_clienteId]
                    FOREIGN KEY ([clienteId])
                    REFERENCES [dbo].[Clientes] ([clienteId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[accesos]
    (
        [perfilId] INT NOT NULL,
        [objetoId] INT NOT NULL,
        [accesoActivo] BIT NOT NULL
            DEFAULT CAST(0 AS BIT),
        [Id] INT NOT NULL IDENTITY,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_accesos]
                    PRIMARY KEY ([perfilId], [objetoId]),
        CONSTRAINT [FK_accesos_Objetos_objetoId]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_accesos_Perfiles_perfilId]
                    FOREIGN KEY ([perfilId])
                    REFERENCES [dbo].[Perfiles] ([perfilId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Usuarios]
    (
        [usuarioId] INT NOT NULL IDENTITY,
        [usuarioApellidos] VARCHAR(256) NOT NULL DEFAULT '',
        [usuarioToken] UNIQUEIDENTIFIER NULL,
        [usuarioActivo] BIT NOT NULL DEFAULT CAST(1 AS BIT),
        [usuarioContrasenaRecuperacion] VARCHAR(256) NULL,
        [perfilId] INT NOT NULL DEFAULT 1,
        [empleadoId] INT NULL,
        [objetoId] INT NOT NULL DEFAULT 2,
        [usuarioNombre] VARCHAR(256) NOT NULL DEFAULT '',
        [usuarioEmail] VARCHAR(256) NULL,
        [usuarioMovil] VARCHAR(256) NULL,
        [passwordHash] VARCHAR(256) NULL,
        [securityStamp] VARCHAR(256) NULL,
        [concurrencyStamp] VARCHAR(256) NULL,
        [lockoutEnd] DATETIMEOFFSET NULL,
        [lockoutEnabled] BIT NOT NULL DEFAULT CAST(1 AS BIT),
        [accessFailedCount] INT NOT NULL DEFAULT 0,
        [usuarioContrasena] VARBINARY(500) NULL,
        [usuarioNumero] INT NOT NULL,
        [normalizedUsuarioNombre] VARCHAR(256) NULL,
        [normalizedUsuarioEmail] VARCHAR(256) NULL,
        [emailConfirmado] BIT NOT NULL DEFAULT CAST(0 AS BIT),
        [phoneNumberConfirmed] BIT NOT NULL DEFAULT CAST(0 AS BIT),
        [twoFactorEnabled] BIT NOT NULL
            DEFAULT CAST(0 AS BIT),
        CONSTRAINT [PK_Usuarios]
                    PRIMARY KEY ([usuarioId]),
        CONSTRAINT [FK_Usuario_Objeto]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Usuario_Perfil]
                    FOREIGN KEY ([perfilId])
                    REFERENCES [dbo].[Perfiles] ([perfilId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Usuarios_empleados_empleadoId]
                    FOREIGN KEY ([empleadoId])
                    REFERENCES [dbo].[empleados] ([empleadoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [AspNetUserClaims]
    (
        [Id] INT NOT NULL IDENTITY,
        [UserId] INT NOT NULL,
        [ClaimType] VARCHAR(256) NULL,
        [ClaimValue] VARCHAR(256) NULL,
        CONSTRAINT [PK_AspNetUserClaims]
                    PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_Usuarios_UserId]
                    FOREIGN KEY ([UserId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [AspNetUserLogins]
    (
        [LoginProvider] NVARCHAR(450) NOT NULL,
        [ProviderKey] NVARCHAR(450) NOT NULL,
        [ProviderDisplayName] VARCHAR(256) NULL,
        [UserId] INT NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins]
                    PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_Usuarios_UserId]
                    FOREIGN KEY ([UserId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [AspNetUserRoles]
    (
        [UserId] INT NOT NULL,
        [RoleId] INT NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles]
                    PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId]
                    FOREIGN KEY ([RoleId])
                    REFERENCES [AspNetRoles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AspNetUserRoles_Usuarios_UserId]
                    FOREIGN KEY ([UserId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [AspNetUserTokens]
    (
        [UserId] INT NOT NULL,
        [LoginProvider] NVARCHAR(450) NOT NULL,
        [Name] NVARCHAR(450) NOT NULL,
        [Value] VARCHAR(256) NULL,
        CONSTRAINT [PK_AspNetUserTokens]
                    PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_Usuarios_UserId]
                    FOREIGN KEY ([UserId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Proyectos]
    (
        [proyectoId] INT NOT NULL IDENTITY,
        [proyectoNombre] VARCHAR(256) NOT NULL,
        [proyectoCodigo] VARCHAR(256) NULL,
        [proyectoDescripcion] VARCHAR(256) NULL,
        [proyectoFechaInicio] DATETIME NULL,
        [proyectoFechaFinPlanificada] DATETIME NULL,
        [proyectoFechaFinReal] DATETIME NULL,
        [estadoProyectoId] INT NOT NULL,
        [tipoProyectoId] INT NOT NULL,
        [clienteId] INT NOT NULL,
        [gerenteId] INT NOT NULL,
        [proyectoPresupuesto] DECIMAL(18, 2) NULL,
        [proyectoRetornoInversionObjetivo] DECIMAL(10, 2) NULL,
        [proyectoPorcentajeAvance] DECIMAL(5, 2) NULL,
        [proyectoActivo] BIT NOT NULL,
        [objetoId] INT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Proyectos]
                    PRIMARY KEY ([proyectoId]),
        CONSTRAINT [FK_Proyectos_Clientes_clienteId]
                    FOREIGN KEY ([clienteId])
                    REFERENCES [dbo].[Clientes] ([clienteId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Proyectos_EstadosProyecto_estadoProyectoId]
                    FOREIGN KEY ([estadoProyectoId])
                    REFERENCES [dbo].[EstadosProyecto] ([estadoProyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Proyectos_Objetos_objetoId]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Proyectos_TiposProyecto_tipoProyectoId]
                    FOREIGN KEY ([tipoProyectoId])
                    REFERENCES [dbo].[TiposProyecto] ([tipoProyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Proyectos_Usuarios_gerenteId]
                    FOREIGN KEY ([gerenteId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[refresh_tokens]
    (
        [refreshTokenId] INT NOT NULL IDENTITY,
        [refreshTokenCreadoPorIp] VARCHAR(256) NOT NULL,
        [refreshTokenFechaExpiracion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [refreshTokenFechaRevocacion] DATETIME NULL,
        [refreshTokenRazonRevocacion] VARCHAR(256) NULL,
        [refreshTokenReemplazadoPorToken] VARCHAR(256) NULL,
        [refreshTokenRevocado] BIT NOT NULL
            DEFAULT CAST(0 AS BIT),
        [refreshTokenToken] VARCHAR(256) NOT NULL,
        [usuarioId] INT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_refresh_tokens]
                    PRIMARY KEY ([refreshTokenId]),
        CONSTRAINT [FK_refresh_tokens_Usuarios_usuarioId]
                    FOREIGN KEY ([usuarioId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[usuario_tokens]
    (
        [usuarioTokenId] INT NOT NULL IDENTITY,
        [usuarioTokenActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [usuarioTokenFechaExpiracion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [usuarioTokenToken] UNIQUEIDENTIFIER NOT NULL,
        [usuarioTokenUsado] BIT NOT NULL,
        [usuarioId] INT NOT NULL,
        [usuarioJwtId] UNIQUEIDENTIFIER NOT NULL,
        [usuarioTokenIpUso] VARCHAR(256) NULL,
        [usuarioTokenMotivoUso] VARCHAR(256) NULL,
        [usuarioTokenFechaUso] DATETIME NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_usuario_tokens]
                    PRIMARY KEY ([usuarioTokenId]),
        CONSTRAINT [FK_usuario_tokens_Usuarios_usuarioId]
                    FOREIGN KEY ([usuarioId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[AsignacionesViatico]
    (
        [asignacionViaticoId] INT NOT NULL IDENTITY,
        [proyectoId] INT NOT NULL,
        [empleadoId] INT NOT NULL,
        [asignacionViaticoConcepto] VARCHAR(256) NOT NULL,
        [asignacionViaticoMontoTotal] DECIMAL(18, 2) NOT NULL,
        [monedaId] INT NOT NULL,
        [asignacionViaticoFechaInicio] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [asignacionViaticoFechaFin] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [asignacionViaticoDestino] VARCHAR(256) NULL,
        [asignacionViaticoPropositoViaje] VARCHAR(256) NULL,
        [estadoAprobacionId] INT NOT NULL,
        [aprobadoPorId] INT NULL,
        [asignacionViaticoFechaAprobacion] DATETIME NULL,
        [asignacionViaticoEsLiquidada] BIT NOT NULL,
        [asignacionViaticoFechaLiquidacion] DATETIME NULL,
        [asignacionViaticoSaldoPendiente] DECIMAL(18, 2) NULL,
        [asignacionViaticoComentarios] VARCHAR(256) NULL,
        [asignacionViaticoActiva] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_AsignacionesViatico]
                    PRIMARY KEY ([asignacionViaticoId]),
        CONSTRAINT [FK_AsignacionesViatico_EstadosAprobacion_estadoAprobacionId]
                    FOREIGN KEY ([estadoAprobacionId])
                    REFERENCES [dbo].[EstadosAprobacion] ([estadoAprobacionId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AsignacionesViatico_Monedas_monedaId]
                    FOREIGN KEY ([monedaId])
                    REFERENCES [dbo].[Monedas] ([monedaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AsignacionesViatico_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AsignacionesViatico_Usuarios_aprobadoPorId]
                    FOREIGN KEY ([aprobadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AsignacionesViatico_empleados_empleadoId]
                    FOREIGN KEY ([empleadoId])
                    REFERENCES [dbo].[empleados] ([empleadoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[CarpetasDocumento]
    (
        [carpetaDocumentoId] INT NOT NULL IDENTITY,
        [carpetaDocumentoNombre] VARCHAR(256) NOT NULL,
        [carpetaDocumentoDescripcion] VARCHAR(256) NULL,
        [proyectoId] INT NOT NULL,
        [carpetaPadreId] INT NULL,
        [carpetaDocumentoFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [creadoPorId] INT NOT NULL,
        [carpetaDocumentoActiva] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_CarpetasDocumento]
                    PRIMARY KEY ([carpetaDocumentoId]),
        CONSTRAINT [FK_CarpetasDocumento_CarpetasDocumento_carpetaPadreId]
                    FOREIGN KEY ([carpetaPadreId])
                    REFERENCES [dbo].[CarpetasDocumento] ([carpetaDocumentoId]),
        CONSTRAINT [FK_CarpetasDocumento_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_CarpetasDocumento_Usuarios_creadoPorId]
                    FOREIGN KEY ([creadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[EtapasProyecto]
    (
        [etapaProyectoId] INT NOT NULL IDENTITY,
        [proyectoId] INT NOT NULL,
        [etapaProyectoNombre] VARCHAR(256) NOT NULL,
        [etapaProyectoDescripcion] VARCHAR(256) NULL,
        [etapaProyectoOrden] INT NOT NULL,
        [etapaProyectoFechaInicio] DATETIME NULL,
        [etapaProyectoFechaFin] DATETIME NULL,
        [etapaProyectoFechaInicioReal] DATETIME NULL,
        [etapaProyectoFechaFinReal] DATETIME NULL,
        [etapaProyectoPorcentajeCompletado] DECIMAL(5, 2) NULL,
        [estadoEtapaId] INT NOT NULL,
        [etapaProyectoEsPredefinida] BIT NOT NULL,
        [etapaProyectoActiva] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_EtapasProyecto]
                    PRIMARY KEY ([etapaProyectoId]),
        CONSTRAINT [FK_EtapasProyecto_EstadosEtapa_estadoEtapaId]
                    FOREIGN KEY ([estadoEtapaId])
                    REFERENCES [dbo].[EstadosEtapa] ([estadoEtapaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_EtapasProyecto_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Gastos]
    (
        [gastoId] INT NOT NULL IDENTITY,
        [gastoConcepto] VARCHAR(256) NOT NULL,
        [gastoMonto] DECIMAL(18, 2) NOT NULL,
        [gastoFecha] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [proyectoId] INT NOT NULL,
        [categoriaGastoId] INT NOT NULL,
        [empleadoId] INT NOT NULL,
        [monedaId] INT NOT NULL,
        [gastoTipoCambio] DECIMAL(18, 6) NULL,
        [gastoNumeroFactura] VARCHAR(256) NULL,
        [gastoProveedor] VARCHAR(256) NULL,
        [gastoProveedorRFC] VARCHAR(256) NULL,
        [gastoRutaComprobante] VARCHAR(256) NULL,
        [estadoAprobacionId] INT NOT NULL,
        [aprobadoPorId] INT NULL,
        [gastoFechaAprobacion] DATETIME NULL,
        [gastoComentarios] VARCHAR(256) NULL,
        [gastoEsReembolsable] BIT NOT NULL,
        [gastoActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Gastos]
                    PRIMARY KEY ([gastoId]),
        CONSTRAINT [FK_Gastos_CategoriasGasto_categoriaGastoId]
                    FOREIGN KEY ([categoriaGastoId])
                    REFERENCES [dbo].[CategoriasGasto] ([categoriaGastoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Gastos_EstadosAprobacion_estadoAprobacionId]
                    FOREIGN KEY ([estadoAprobacionId])
                    REFERENCES [dbo].[EstadosAprobacion] ([estadoAprobacionId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Gastos_Monedas_monedaId]
                    FOREIGN KEY ([monedaId])
                    REFERENCES [dbo].[Monedas] ([monedaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Gastos_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Gastos_Usuarios_aprobadoPorId]
                    FOREIGN KEY ([aprobadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]),
        CONSTRAINT [FK_Gastos_empleados_empleadoId]
                    FOREIGN KEY ([empleadoId])
                    REFERENCES [dbo].[empleados] ([empleadoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[InformesSemanales]
    (
        [informeSemanalId] INT NOT NULL IDENTITY,
        [proyectoId] INT NOT NULL,
        [informeSemanalTitulo] VARCHAR(256) NOT NULL,
        [informeSemanalFechaInicio] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [informeSemanalFechaFin] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [informeSemanalNumeroSemana] INT NOT NULL,
        [informeSemanalResumenActividades] VARCHAR(256) NOT NULL,
        [informeSemanalLogros] VARCHAR(256) NULL,
        [informeSemanalProblemas] VARCHAR(256) NULL,
        [informeSemanalSoluciones] VARCHAR(256) NULL,
        [informeSemanalActividadesProximaSemana] VARCHAR(256) NULL,
        [informeSemanalPorcentajeAvance] DECIMAL(5, 2) NOT NULL,
        [informeSemanalComentarios] VARCHAR(256) NULL,
        [creadoPorId] INT NOT NULL,
        [informeSemanalFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [estadoAprobacionId] INT NOT NULL,
        [aprobadoPorId] INT NULL,
        [informeSemanalFechaAprobacion] DATETIME NULL,
        [informeSemanalActivo] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_InformesSemanales]
                    PRIMARY KEY ([informeSemanalId]),
        CONSTRAINT [FK_InformesSemanales_EstadosAprobacion_estadoAprobacionId]
                    FOREIGN KEY ([estadoAprobacionId])
                    REFERENCES [dbo].[EstadosAprobacion] ([estadoAprobacionId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_InformesSemanales_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_InformesSemanales_Usuarios_aprobadoPorId]
                    FOREIGN KEY ([aprobadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]),
        CONSTRAINT [FK_InformesSemanales_Usuarios_creadoPorId]
                    FOREIGN KEY ([creadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Kpis]
    (
        [kpiId] INT NOT NULL IDENTITY,
        [kpiNombre] VARCHAR(256) NOT NULL,
        [kpiDescripcion] VARCHAR(256) NULL,
        [tipoKPIId] INT NOT NULL,
        [kpiUnidad] VARCHAR(256) NULL,
        [kpiValorBase] DECIMAL(18, 4) NULL,
        [kpiValorObjetivo] DECIMAL(18, 4) NULL,
        [kpiValorMinimo] DECIMAL(18, 4) NULL,
        [proyectoId] INT NOT NULL,
        [frecuenciaMedicionId] INT NOT NULL,
        [kpiFechaInicio] DATETIME NULL,
        [kpiFechaFin] DATETIME NULL,
        [kpiActivo] BIT NOT NULL,
        [creadoPorId] INT NOT NULL,
        [kpiFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [kpiEsOperativo] BIT NOT NULL,
        [kpiEsFinanciero] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Kpis]
                    PRIMARY KEY ([kpiId]),
        CONSTRAINT [FK_Kpis_FrecuenciasMedicion_frecuenciaMedicionId]
                    FOREIGN KEY ([frecuenciaMedicionId])
                    REFERENCES [dbo].[FrecuenciasMedicion] ([frecuenciaMedicionId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Kpis_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Kpis_TiposKpi_tipoKPIId]
                    FOREIGN KEY ([tipoKPIId])
                    REFERENCES [dbo].[TiposKpi] ([tipoKPIId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Kpis_Usuarios_creadoPorId]
                    FOREIGN KEY ([creadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[MovimientosViatico]
    (
        [movimientoViaticoId] INT NOT NULL IDENTITY,
        [asignacionViaticoId] INT NOT NULL,
        [tipoMovimientoViaticoId] INT NOT NULL,
        [movimientoViaticoConcepto] VARCHAR(256) NOT NULL,
        [movimientoViaticoMonto] DECIMAL(18, 2) NOT NULL,
        [movimientoViaticoFecha] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [categoriaGastoId] INT NULL,
        [movimientoViaticoRutaComprobante] VARCHAR(256) NULL,
        [registradoPorId] INT NOT NULL,
        [movimientoViaticoFechaRegistro] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [movimientoViaticoComentarios] VARCHAR(256) NULL,
        [movimientoViaticoActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_MovimientosViatico]
                    PRIMARY KEY ([movimientoViaticoId]),
        CONSTRAINT [FK_MovimientosViatico_AsignacionesViatico_asignacionViaticoId]
                    FOREIGN KEY ([asignacionViaticoId])
                    REFERENCES [dbo].[AsignacionesViatico] ([asignacionViaticoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MovimientosViatico_CategoriasGasto_categoriaGastoId]
                    FOREIGN KEY ([categoriaGastoId])
                    REFERENCES [dbo].[CategoriasGasto] ([categoriaGastoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MovimientosViatico_TiposMovimientoViatico_tipoMovimientoViaticoId]
                    FOREIGN KEY ([tipoMovimientoViaticoId])
                    REFERENCES [dbo].[TiposMovimientoViatico] ([tipoMovimientoViaticoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MovimientosViatico_Usuarios_registradoPorId]
                    FOREIGN KEY ([registradoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Documentos]
    (
        [documentoId] INT NOT NULL IDENTITY,
        [documentoNombre] VARCHAR(256) NOT NULL,
        [documentoDescripcion] VARCHAR(256) NULL,
        [documentoRutaAlmacenamiento] VARCHAR(256) NOT NULL,
        [documentoNombreArchivo] VARCHAR(256) NOT NULL,
        [documentoExtension] VARCHAR(256) NULL,
        [tipoDocumentoId] INT NOT NULL,
        [documentoTamano] BIGINT NULL,
        [documentoFechaSubida] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [documentoFechaModificacion] DATETIME NULL,
        [documentoVersionActual] INT NOT NULL,
        [proyectoId] INT NOT NULL,
        [etapaProyectoId] INT NULL,
        [carpetaDocumentoId] INT NULL,
        [subidoPorId] INT NOT NULL,
        [documentoEsPublico] BIT NOT NULL,
        [documentoEtiquetas] VARCHAR(256) NULL,
        [documentoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        CONSTRAINT [PK_Documentos]
                    PRIMARY KEY ([documentoId]),
        CONSTRAINT [FK_Documentos_CarpetasDocumento_carpetaDocumentoId]
                    FOREIGN KEY ([carpetaDocumentoId])
                    REFERENCES [dbo].[CarpetasDocumento] ([carpetaDocumentoId]),
        CONSTRAINT [FK_Documentos_EtapasProyecto_etapaProyectoId]
                    FOREIGN KEY ([etapaProyectoId])
                    REFERENCES [dbo].[EtapasProyecto] ([etapaProyectoId]),
        CONSTRAINT [FK_Documentos_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Documentos_TiposDocumento_tipoDocumentoId]
                    FOREIGN KEY ([tipoDocumentoId])
                    REFERENCES [dbo].[TiposDocumento] ([tipoDocumentoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Documentos_Usuarios_subidoPorId]
                    FOREIGN KEY ([subidoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[Tareas]
    (
        [tareaId] INT NOT NULL IDENTITY,
        [tareaTitulo] VARCHAR(256) NOT NULL,
        [tareaDescripcion] VARCHAR(256) NULL,
        [proyectoId] INT NOT NULL,
        [etapaProyectoId] INT NULL,
        [estadoTareaId] INT NOT NULL,
        [prioridadTareaId] INT NOT NULL,
        [tareaFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [tareaFechaVencimiento] DATETIME NULL,
        [tareaFechaCompletada] DATETIME NULL,
        [tareaPorcentajeCompletado] DECIMAL(5, 2) NULL,
        [creadoPorId] INT NOT NULL,
        [asignadoAId] INT NULL,
        [tareaEsRecordatorio] BIT NOT NULL,
        [tareaFechaRecordatorio] DATETIME NULL,
        [tareaEsPrivada] BIT NOT NULL,
        [tareaTieneArchivosAdjuntos] BIT NOT NULL,
        [tareaActiva] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Tareas]
                    PRIMARY KEY ([tareaId]),
        CONSTRAINT [FK_Tareas_EstadosTarea_estadoTareaId]
                    FOREIGN KEY ([estadoTareaId])
                    REFERENCES [dbo].[EstadosTarea] ([estadoTareaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Tareas_EtapasProyecto_etapaProyectoId]
                    FOREIGN KEY ([etapaProyectoId])
                    REFERENCES [dbo].[EtapasProyecto] ([etapaProyectoId]),
        CONSTRAINT [FK_Tareas_PrioridadesTarea_prioridadTareaId]
                    FOREIGN KEY ([prioridadTareaId])
                    REFERENCES [dbo].[PrioridadesTarea] ([prioridadTareaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Tareas_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Tareas_Usuarios_asignadoAId]
                    FOREIGN KEY ([asignadoAId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]),
        CONSTRAINT [FK_Tareas_Usuarios_creadoPorId]
                    FOREIGN KEY ([creadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[MedicionesKpi]
    (
        [medicionKPIId] INT NOT NULL IDENTITY,
        [kpiId] INT NOT NULL,
        [medicionKPIValor] DECIMAL(18, 4) NOT NULL,
        [medicionKPIFecha] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [medicionKPIPeriodo] VARCHAR(256) NULL,
        [medicionKPIComentarios] VARCHAR(256) NULL,
        [usuarioId] INT NOT NULL,
        [medicionKPIFechaRegistro] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [medicionKPIActiva] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_MedicionesKpi]
                    PRIMARY KEY ([medicionKPIId]),
        CONSTRAINT [FK_MedicionesKpi_Kpis_kpiId]
                    FOREIGN KEY ([kpiId])
                    REFERENCES [dbo].[Kpis] ([kpiId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MedicionesKpi_Usuarios_usuarioId]
                    FOREIGN KEY ([usuarioId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[VersionesDocumento]
    (
        [versionDocumentoId] INT NOT NULL IDENTITY,
        [documentoId] INT NOT NULL,
        [versionDocumentoNumero] INT NOT NULL,
        [versionDocumentoRutaAlmacenamiento] VARCHAR(256) NOT NULL,
        [versionDocumentoTamano] BIGINT NULL,
        [versionDocumentoFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [versionDocumentoComentario] VARCHAR(256) NULL,
        [usuarioId] INT NOT NULL,
        [versionDocumentoEsVersionActual] BIT NOT NULL,
        [versionDocumentoActiva] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_VersionesDocumento]
                    PRIMARY KEY ([versionDocumentoId]),
        CONSTRAINT [FK_VersionesDocumento_Documentos_documentoId]
                    FOREIGN KEY ([documentoId])
                    REFERENCES [dbo].[Documentos] ([documentoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_VersionesDocumento_Usuarios_usuarioId]
                    FOREIGN KEY ([usuarioId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[ComentariosTarea]
    (
        [comentarioId] INT NOT NULL IDENTITY,
        [tareaId] INT NOT NULL,
        [usuarioId] INT NOT NULL,
        [comentarioContenido] VARCHAR(256) NOT NULL,
        [comentarioFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [comentarioTieneArchivosAdjuntos] BIT NOT NULL,
        [comentarioActivo] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_ComentariosTarea]
                    PRIMARY KEY ([comentarioId]),
        CONSTRAINT [FK_ComentariosTarea_Tareas_tareaId]
                    FOREIGN KEY ([tareaId])
                    REFERENCES [dbo].[Tareas] ([tareaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ComentariosTarea_Usuarios_usuarioId]
                    FOREIGN KEY ([usuarioId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE TABLE [dbo].[ArchivosAdjuntos]
    (
        [archivoAdjuntoId] INT NOT NULL IDENTITY,
        [tareaId] INT NULL,
        [comentarioId] INT NULL,
        [archivoAdjuntoNombre] VARCHAR(256) NOT NULL,
        [archivoAdjuntoRutaAlmacenamiento] VARCHAR(256) NOT NULL,
        [archivoAdjuntoExtension] VARCHAR(256) NULL,
        [archivoAdjuntoTamano] BIGINT NULL,
        [archivoAdjuntoFechaSubida] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [subidoPorId] INT NOT NULL,
        [archivoAdjuntoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_ArchivosAdjuntos]
                    PRIMARY KEY ([archivoAdjuntoId]),
        CONSTRAINT [FK_ArchivosAdjuntos_ComentariosTarea_comentarioId]
                    FOREIGN KEY ([comentarioId])
                    REFERENCES [dbo].[ComentariosTarea] ([comentarioId]),
        CONSTRAINT [FK_ArchivosAdjuntos_Tareas_tareaId]
                    FOREIGN KEY ([tareaId])
                    REFERENCES [dbo].[Tareas] ([tareaId]),
        CONSTRAINT [FK_ArchivosAdjuntos_Usuarios_subidoPorId]
                    FOREIGN KEY ([subidoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_accesos_objetoId]
            ON [dbo].[accesos] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_accesos_perfilId_objetoId]
            ON [dbo].[accesos] ([perfilId], [objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_ArchivosAdjuntos_comentarioId]
            ON [dbo].[ArchivosAdjuntos] ([comentarioId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_ArchivosAdjuntos_subidoPorId]
            ON [dbo].[ArchivosAdjuntos] ([subidoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_ArchivosAdjuntos_tareaId]
            ON [dbo].[ArchivosAdjuntos] ([tareaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_AsignacionesViatico_aprobadoPorId]
            ON [dbo].[AsignacionesViatico] ([aprobadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_AsignacionesViatico_empleadoId]
            ON [dbo].[AsignacionesViatico] ([empleadoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_AsignacionesViatico_estadoAprobacionId]
            ON [dbo].[AsignacionesViatico] ([estadoAprobacionId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_AsignacionesViatico_monedaId]
            ON [dbo].[AsignacionesViatico] ([monedaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_AsignacionesViatico_proyectoId]
            ON [dbo].[AsignacionesViatico] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_AspNetRoleClaims_RoleId]
            ON [AspNetRoleClaims] ([RoleId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    EXEC (N'CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_AspNetUserClaims_UserId]
            ON [AspNetUserClaims] ([UserId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_AspNetUserLogins_UserId]
            ON [AspNetUserLogins] ([UserId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_AspNetUserRoles_RoleId]
            ON [AspNetUserRoles] ([RoleId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_CarpetasDocumento_carpetaPadreId]
            ON [dbo].[CarpetasDocumento] ([carpetaPadreId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_CarpetasDocumento_creadoPorId]
            ON [dbo].[CarpetasDocumento] ([creadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_CarpetasDocumento_proyectoId]
            ON [dbo].[CarpetasDocumento] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Clientes_objetoId]
            ON [dbo].[Clientes] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_ComentariosTarea_tareaId]
            ON [dbo].[ComentariosTarea] ([tareaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_ComentariosTarea_usuarioId]
            ON [dbo].[ComentariosTarea] ([usuarioId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_ContactosCliente_clienteId]
            ON [dbo].[ContactosCliente] ([clienteId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Documentos_carpetaDocumentoId]
            ON [dbo].[Documentos] ([carpetaDocumentoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Documentos_etapaProyectoId]
            ON [dbo].[Documentos] ([etapaProyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Documentos_proyectoId]
            ON [dbo].[Documentos] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Documentos_subidoPorId]
            ON [dbo].[Documentos] ([subidoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Documentos_tipoDocumentoId]
            ON [dbo].[Documentos] ([tipoDocumentoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Empleados_ObjetoId]
            ON [dbo].[empleados] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Empleados_PuestoId]
            ON [dbo].[empleados] ([puestoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_EtapasProyecto_estadoEtapaId]
            ON [dbo].[EtapasProyecto] ([estadoEtapaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_EtapasProyecto_proyectoId]
            ON [dbo].[EtapasProyecto] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_aprobadoPorId]
            ON [dbo].[Gastos] ([aprobadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_categoriaGastoId]
            ON [dbo].[Gastos] ([categoriaGastoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_empleadoId]
            ON [dbo].[Gastos] ([empleadoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_estadoAprobacionId]
            ON [dbo].[Gastos] ([estadoAprobacionId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_monedaId]
            ON [dbo].[Gastos] ([monedaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_proyectoId]
            ON [dbo].[Gastos] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_InformesSemanales_aprobadoPorId]
            ON [dbo].[InformesSemanales] ([aprobadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_InformesSemanales_creadoPorId]
            ON [dbo].[InformesSemanales] ([creadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_InformesSemanales_estadoAprobacionId]
            ON [dbo].[InformesSemanales] ([estadoAprobacionId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_InformesSemanales_proyectoId]
            ON [dbo].[InformesSemanales] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Kpis_creadoPorId]
            ON [dbo].[Kpis] ([creadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Kpis_frecuenciaMedicionId]
            ON [dbo].[Kpis] ([frecuenciaMedicionId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Kpis_proyectoId]
            ON [dbo].[Kpis] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Kpis_tipoKPIId]
            ON [dbo].[Kpis] ([tipoKPIId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_MedicionesKpi_kpiId]
            ON [dbo].[MedicionesKpi] ([kpiId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_MedicionesKpi_usuarioId]
            ON [dbo].[MedicionesKpi] ([usuarioId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Menus_menuPadreId]
            ON [dbo].[Menus] ([menuPadreId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_Monedas_monedaCodigo]
            ON [dbo].[Monedas] ([monedaCodigo]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_MovimientosViatico_asignacionViaticoId]
            ON [dbo].[MovimientosViatico] ([asignacionViaticoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_MovimientosViatico_categoriaGastoId]
            ON [dbo].[MovimientosViatico] ([categoriaGastoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_MovimientosViatico_registradoPorId]
            ON [dbo].[MovimientosViatico] ([registradoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_MovimientosViatico_tipoMovimientoViaticoId]
            ON [dbo].[MovimientosViatico] ([tipoMovimientoViaticoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Objetos_MenuId]
            ON [dbo].[Objetos] ([menuId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Objetos_MenuId1]
            ON [dbo].[Objetos] ([MenuId1]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_Objetos_objetoNombre]
            ON [dbo].[Objetos] ([objetoNombre]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Objetos_objetoTipoId]
            ON [dbo].[Objetos] ([objetoTipoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_objetos_tipo_objetoTipoNombre]
            ON [dbo].[objetos_tipo] ([objetoTipoNombre]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Perfiles_objetoId]
            ON [dbo].[Perfiles] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_Perfiles_perfilNombre]
            ON [dbo].[Perfiles] ([perfilNombre]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Proyectos_clienteId]
            ON [dbo].[Proyectos] ([clienteId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Proyectos_estadoProyectoId]
            ON [dbo].[Proyectos] ([estadoProyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Proyectos_gerenteId]
            ON [dbo].[Proyectos] ([gerenteId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Proyectos_objetoId]
            ON [dbo].[Proyectos] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Proyectos_tipoProyectoId]
            ON [dbo].[Proyectos] ([tipoProyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_refresh_tokens_refreshTokenToken]
            ON [dbo].[refresh_tokens] ([refreshTokenToken]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_refresh_tokens_usuarioId]
            ON [dbo].[refresh_tokens] ([usuarioId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_asignadoAId]
            ON [dbo].[Tareas] ([asignadoAId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_creadoPorId]
            ON [dbo].[Tareas] ([creadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_estadoTareaId]
            ON [dbo].[Tareas] ([estadoTareaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_etapaProyectoId]
            ON [dbo].[Tareas] ([etapaProyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_prioridadTareaId]
            ON [dbo].[Tareas] ([prioridadTareaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_proyectoId]
            ON [dbo].[Tareas] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_usuario_tokens_usuarioId]
            ON [dbo].[usuario_tokens] ([usuarioId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_usuario_tokens_usuarioTokenToken]
            ON [dbo].[usuario_tokens] ([usuarioTokenToken]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [EmailIndex]
            ON [dbo].[Usuarios] ([normalizedUsuarioEmail]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    EXEC (N'CREATE UNIQUE INDEX [IX_Usuarios_EmpleadoId] ON [dbo].[Usuarios] ([empleadoId]) WHERE [empleadoId] IS NOT NULL');
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Usuarios_ObjetoId]
            ON [dbo].[Usuarios] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_Usuarios_PerfilId]
            ON [dbo].[Usuarios] ([perfilId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    EXEC (N'CREATE UNIQUE INDEX [IX_Usuarios_usuarioEmail] ON [dbo].[Usuarios] ([usuarioEmail]) WHERE [usuarioEmail] IS NOT NULL');
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    EXEC (N'CREATE UNIQUE INDEX [UserNameIndex] ON [dbo].[Usuarios] ([normalizedUsuarioNombre]) WHERE [normalizedUsuarioNombre] IS NOT NULL');
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_VersionesDocumento_documentoId]
            ON [dbo].[VersionesDocumento] ([documentoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    CREATE INDEX [IX_VersionesDocumento_usuarioId]
            ON [dbo].[VersionesDocumento] ([usuarioId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250604180151_CreateUsuariosTable'
    )
    BEGIN
    INSERT INTO [__EFMigrationsHistory]
        (
        [MigrationId],
        [ProductVersion]
        )
    VALUES
        (
            N'20250604180151_CreateUsuariosTable', N'9.0.5'
            );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610041255_RenameMenuIdColumn'
    )
    BEGIN
    ALTER TABLE [Objetos]
        DROP
        CONSTRAINT [FK_Objetos_Menus_menuId];
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610041255_RenameMenuIdColumn'
    )
    BEGIN
    EXEC sp_rename
            N'[Menus].[Id]',
            N'menuId',
            'COLUMN';
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610041255_RenameMenuIdColumn'
    )
    BEGIN
    EXEC sp_rename
            N'[Objetos].[MenuId]',
            N'menuId',
            'COLUMN';
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610041255_RenameMenuIdColumn'
    )
    BEGIN
    ALTER TABLE [Objetos]
        ADD
            CONSTRAINT [FK_Objetos_Menus_menuId]
            FOREIGN KEY ([menuId])
            REFERENCES [Menus] ([menuId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610041255_RenameMenuIdColumn'
    )
    BEGIN
    INSERT INTO [__EFMigrationsHistory]
        (
        [MigrationId],
        [ProductVersion]
        )
    VALUES
        (
            N'20250610041255_RenameMenuIdColumn', N'9.0.5'
            );
END;


IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610042541_RenameMenuIdToLowercase'
    )
    BEGIN
    INSERT INTO [__EFMigrationsHistory]
        (
        [MigrationId],
        [ProductVersion]
        )
    VALUES
        (
            N'20250610042541_RenameMenuIdToLowercase', N'9.0.5'
            );
END;


IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610074000_SeedInitialDataOnly'
    )
    BEGIN

    -- Activar IDENTITY_INSERT para ObjetoTipos
    SET IDENTITY_INSERT [dbo].[ObjetoTipos] ON;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[ObjetoTipos]
    WHERE
                    [objetoTipoId] = 1
            )
            BEGIN
        INSERT INTO [dbo].[ObjetoTipos]
            (
            [objetoTipoId],
            [objetoTipoNombre],
            [objetoTipoDescripcion]
            )
        VALUES
            (
                1, 'Menú', 'Elemento de navegación principal'
                    );
    END;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[ObjetoTipos]
    WHERE
                    [objetoTipoId] = 2
            )
            BEGIN
        INSERT INTO [dbo].[ObjetoTipos]
            (
            [objetoTipoId],
            [objetoTipoNombre],
            [objetoTipoDescripcion]
            )
        VALUES
            (
                2, 'Submenu', 'Elemento de navegación secundario'
                    );
    END;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[ObjetoTipos]
    WHERE
                    [objetoTipoId] = 3
            )
            BEGIN
        INSERT INTO [dbo].[ObjetoTipos]
            (
            [objetoTipoId],
            [objetoTipoNombre],
            [objetoTipoDescripcion]
            )
        VALUES
            (
                3, 'Acción', 'Acción específica dentro de un menú'
                    );
    END;

    -- Desactivar IDENTITY_INSERT para ObjetoTipos
    SET IDENTITY_INSERT [dbo].[ObjetoTipos] OFF;

END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610074000_SeedInitialDataOnly'
    )
    BEGIN

    -- Activar IDENTITY_INSERT para Menus
    SET IDENTITY_INSERT [dbo].[Menus] ON;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Menus]
    WHERE
                    [menuId] = 1
            )
            BEGIN
        INSERT INTO [dbo].[Menus]
            (
            [menuId],
            [descripcion],
            [icono],
            [menuNombre],
            [menuPadreId],
            [orden],
            [ruta]
            )
        VALUES
            (
                1, 'Administración del sistema', 'fa-cogs', 'Administración', NULL, 1, '/admin'
                    );
    END;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Menus]
    WHERE
                    [menuId] = 2
            )
            BEGIN
        INSERT INTO [dbo].[Menus]
            (
            [menuId],
            [descripcion],
            [icono],
            [menuNombre],
            [menuPadreId],
            [orden],
            [ruta]
            )
        VALUES
            (
                2, 'Gestión de usuarios', 'fa-users', 'Usuarios', 1, 1, '/admin/usuarios'
                    );
    END;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Menus]
    WHERE
                    [menuId] = 3
            )
            BEGIN
        INSERT INTO [dbo].[Menus]
            (
            [menuId],
            [descripcion],
            [icono],
            [menuNombre],
            [menuPadreId],
            [orden],
            [ruta]
            )
        VALUES
            (
                3, 'Gestión de perfiles', 'fa-id-card', 'Perfiles', 1, 2, '/admin/perfiles'
                    );
    END;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Menus]
    WHERE
                    [menuId] = 4
            )
            BEGIN
        INSERT INTO [dbo].[Menus]
            (
            [menuId],
            [descripcion],
            [icono],
            [menuNombre],
            [menuPadreId],
            [orden],
            [ruta]
            )
        VALUES
            (
                4, 'Panel principal', 'fa-tachometer-alt', 'Dashboard', NULL, 2, '/dashboard'
                    );
    END;

    -- Desactivar IDENTITY_INSERT para Menus
    SET IDENTITY_INSERT [dbo].[Menus] OFF;

END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610074000_SeedInitialDataOnly'
    )
    BEGIN

    -- Activar IDENTITY_INSERT para Objetos
    SET IDENTITY_INSERT [dbo].[Objetos] ON;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Objetos]
    WHERE
                    [objetoId] = 1
            )
            BEGIN
        INSERT INTO [dbo].[Objetos]
            (
            [objetoId],
            [objetoNombre],
            [objetoTipoId],
            [menuId],
            [objetoActivo]
            )
        VALUES
            (
                1, 'Administración', 1, 1, 1
                    );
    END;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Objetos]
    WHERE
                    [objetoId] = 2
            )
            BEGIN
        INSERT INTO [dbo].[Objetos]
            (
            [objetoId],
            [objetoNombre],
            [objetoTipoId],
            [menuId],
            [objetoActivo]
            )
        VALUES
            (
                2, 'Usuarios', 2, 2, 1
                    );
    END;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Objetos]
    WHERE
                    [objetoId] = 3
            )
            BEGIN
        INSERT INTO [dbo].[Objetos]
            (
            [objetoId],
            [objetoNombre],
            [objetoTipoId],
            [menuId],
            [objetoActivo]
            )
        VALUES
            (
                3, 'Perfiles', 2, 3, 1
                    );
    END;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Objetos]
    WHERE
                    [objetoId] = 4
            )
            BEGIN
        INSERT INTO [dbo].[Objetos]
            (
            [objetoId],
            [objetoNombre],
            [objetoTipoId],
            [menuId],
            [objetoActivo]
            )
        VALUES
            (
                4, 'Dashboard', 1, 4, 1
                    );
    END;

    -- Desactivar IDENTITY_INSERT para Objetos
    SET IDENTITY_INSERT [dbo].[Objetos] OFF;

END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610074000_SeedInitialDataOnly'
    )
    BEGIN

    -- Activar IDENTITY_INSERT para Perfiles
    SET IDENTITY_INSERT [dbo].[Perfiles] ON;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Perfiles]
    WHERE
                    [perfilId] = 1
            )
            BEGIN
        INSERT INTO [dbo].[Perfiles]
            (
            [perfilId],
            [perfilNombre],
            [perfilDescripcion],
            [perfilActivo]
            )
        VALUES
            (
                1, 'Administrador', 'Perfil con acceso completo al sistema', 1
                    );
    END;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Perfiles]
    WHERE
                    [perfilId] = 2
            )
            BEGIN
        INSERT INTO [dbo].[Perfiles]
            (
            [perfilId],
            [perfilNombre],
            [perfilDescripcion],
            [perfilActivo]
            )
        VALUES
            (
                2, 'Usuario', 'Perfil con acceso limitado al sistema', 1
                    );
    END;

    -- Desactivar IDENTITY_INSERT para Perfiles
    SET IDENTITY_INSERT [dbo].[Perfiles] OFF;

END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610074000_SeedInitialDataOnly'
    )
    BEGIN

    -- Activar IDENTITY_INSERT para Usuarios
    SET IDENTITY_INSERT [dbo].[Usuarios] ON;

    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[Usuarios]
    WHERE
                    [usuarioNombre] = 'admin'
            )
            BEGIN
        INSERT INTO [dbo].[Usuarios]
            (
            [usuarioId],
            [usuarioApellidos],
            [usuarioToken],
            [usuarioActivo],
            [usuarioContrasenaRecuperacion],
            [perfilId],
            [empleadoId],
            [objetoId],
            [usuarioNombre],
            [usuarioEmail],
            [usuarioMovil],
            [passwordHash],
            [securityStamp],
            [concurrencyStamp],
            [lockoutEnd],
            [lockoutEnabled],
            [accessFailedCount],
            [usuarioContrasena],
            [usuarioNumero],
            [normalizedUsuarioNombre],
            [normalizedUsuarioEmail],
            [emailConfirmado],
            [phoneNumberConfirmed],
            [twoFactorEnabled]
            )
        VALUES
            (
                1, 'Sistema', NEWID(), 1, NULL, 1, NULL, 2, 'Administrador', 'admin@sistema.com', NULL,
                'AQAAAAIAAYagAAAAEDxb+b7Hj/KLHVnpkxEYSvzT9UAEwGHdZXE3JMT+YJO5xWZ9Yt6EzYYWEzEQvA==',
                'VVPCRDAS3MJWQD5CSW2GWPRADBM3IBDA', NEWID(), NULL, 0, 0, NULL, 0, 'admin', 'ADMIN@SISTEMA.COM',
                1, 0, 0
                    );
    END;

    -- Desactivar IDENTITY_INSERT para Usuarios
    SET IDENTITY_INSERT [dbo].[Usuarios] OFF;

END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610074000_SeedInitialDataOnly'
    )
    BEGIN

    -- Asignar todos los objetos al perfil Administrador
    INSERT INTO [dbo].[PerfilObjetos]
        (
        [perfilId],
        [objetoId]
        )
    SELECT
        1,
        [objetoId]
    FROM
        [dbo].[Objetos]
    WHERE
                        NOT EXISTS
                        (
                            SELECT
        1
    FROM
        [dbo].[PerfilObjetos]
    WHERE
                                [perfilId] = 1
        AND [objetoId] = [dbo].[Objetos].[objetoId]
                        );

    -- Asignar solo el Dashboard al perfil Usuario
    IF NOT EXISTS
            (
                SELECT
        1
    FROM
        [dbo].[PerfilObjetos]
    WHERE
                    [perfilId] = 2
        AND [objetoId] = 4
            )
            BEGIN
        INSERT INTO [dbo].[PerfilObjetos]
            (
            [perfilId],
            [objetoId]
            )
        VALUES
            (
                2, 4
                    );
    END;

END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610074000_SeedInitialDataOnly'
    )
    BEGIN
    INSERT INTO [__EFMigrationsHistory]
        (
        [MigrationId],
        [ProductVersion]
        )
    VALUES
        (
            N'20250610074000_SeedInitialDataOnly', N'9.0.5'
            );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [AspNetRoles]
    (
        [Id] INT NOT NULL IDENTITY,
        [Name] VARCHAR(256) NULL,
        [NormalizedName] VARCHAR(256) NULL,
        [ConcurrencyStamp] VARCHAR(256) NULL,
        CONSTRAINT [PK_AspNetRoles]
                    PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[CategoriasGasto]
    (
        [categoriaGastoId] INT NOT NULL IDENTITY,
        [categoriaGastoNombre] VARCHAR(256) NOT NULL,
        [categoriaGastoDescripcion] VARCHAR(256) NULL,
        [categoriaGastoEsEstandar] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [categoriaGastoRequiereComprobante] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [categoriaGastoLimiteMaximo] DECIMAL(18, 2) NULL,
        [categoriaGastoActiva] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_CategoriasGasto]
                    PRIMARY KEY ([categoriaGastoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[EstadosAprobacion]
    (
        [estadoAprobacionId] INT NOT NULL IDENTITY,
        [estadoAprobacionNombre] VARCHAR(256) NOT NULL,
        [estadoAprobacionDescripcion] VARCHAR(256) NULL,
        [estadoAprobacionColor] VARCHAR(256) NULL,
        [estadoAprobacionEsAprobado] BIT NOT NULL,
        [estadoAprobacionEsRechazado] BIT NOT NULL,
        [estadoAprobacionActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_EstadosAprobacion]
                    PRIMARY KEY ([estadoAprobacionId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[EstadosEtapa]
    (
        [estadoEtapaId] INT NOT NULL IDENTITY,
        [estadoEtapaNombre] VARCHAR(256) NOT NULL,
        [estadoEtapaDescripcion] VARCHAR(256) NULL,
        [estadoEtapaColor] VARCHAR(256) NULL,
        [estadoEtapaOrden] INT NOT NULL,
        [estadoEtapaEsFinal] BIT NOT NULL,
        [estadoEtapaActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_EstadosEtapa]
                    PRIMARY KEY ([estadoEtapaId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[EstadosProyecto]
    (
        [estadoProyectoId] INT NOT NULL IDENTITY,
        [estadoProyectoNombre] VARCHAR(256) NOT NULL,
        [estadoProyectoDescripcion] VARCHAR(256) NULL,
        [estadoProyectoColor] VARCHAR(256) NULL,
        [estadoProyectoOrden] INT NOT NULL,
        [estadoProyectoEsFinal] BIT NOT NULL,
        [estadoProyectoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_EstadosProyecto]
                    PRIMARY KEY ([estadoProyectoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[EstadosTarea]
    (
        [estadoTareaId] INT NOT NULL IDENTITY,
        [estadoTareaNombre] VARCHAR(256) NOT NULL,
        [estadoTareaDescripcion] VARCHAR(256) NULL,
        [estadoTareaColor] VARCHAR(256) NULL,
        [estadoTareaOrden] INT NOT NULL,
        [estadoTareaEsFinal] BIT NOT NULL,
        [estadoTareaActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_EstadosTarea]
                    PRIMARY KEY ([estadoTareaId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[FrecuenciasMedicion]
    (
        [frecuenciaMedicionId] INT NOT NULL IDENTITY,
        [frecuenciaMedicionNombre] VARCHAR(256) NOT NULL,
        [frecuenciaMedicionDescripcion] VARCHAR(256) NULL,
        [frecuenciaMedicionIntervaloDias] INT NOT NULL,
        [frecuenciaMedicionActiva] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_FrecuenciasMedicion]
                    PRIMARY KEY ([frecuenciaMedicionId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Menus]
    (
        [menuId] INT NOT NULL IDENTITY,
        [descripcion] VARCHAR(256) NOT NULL,
        [icono] VARCHAR(256) NOT NULL,
        [menuNombre] VARCHAR(256) NOT NULL,
        [menuPadreId] INT NULL,
        [orden] INT NOT NULL,
        [ruta] VARCHAR(256) NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Menus]
                    PRIMARY KEY ([menuId]),
        CONSTRAINT [FK_Menus_Menus_menuPadreId]
                    FOREIGN KEY ([menuPadreId])
                    REFERENCES [dbo].[Menus] ([menuId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Monedas]
    (
        [monedaId] INT NOT NULL IDENTITY,
        [monedaCodigo] VARCHAR(256) NOT NULL,
        [monedaNombre] VARCHAR(256) NOT NULL,
        [monedaSimbolo] VARCHAR(256) NULL,
        [monedaTasaCambio] DECIMAL(18, 6) NOT NULL,
        [monedaFechaActualizacion] DATETIME NULL,
        [monedaEsPredeterminada] BIT NOT NULL,
        [monedaActiva] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Monedas]
                    PRIMARY KEY ([monedaId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[objetos_tipo]
    (
        [objetoTipoId] INT NOT NULL IDENTITY,
        [objetoTipoNombre] VARCHAR(256) NOT NULL,
        [objetoTipoActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_objetos_tipo]
                    PRIMARY KEY ([objetoTipoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[PrioridadesTarea]
    (
        [prioridadTareaId] INT NOT NULL IDENTITY,
        [prioridadTareaNombre] VARCHAR(256) NOT NULL,
        [prioridadTareaDescripcion] VARCHAR(256) NULL,
        [prioridadTareaColor] VARCHAR(256) NULL,
        [prioridadTareaNivel] INT NOT NULL,
        [prioridadTareaActiva] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_PrioridadesTarea]
                    PRIMARY KEY ([prioridadTareaId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Puestos]
    (
        [puestoId] INT NOT NULL IDENTITY,
        [puestoNombre] VARCHAR(256) NOT NULL,
        [puestoDescripcion] VARCHAR(256) NULL,
        [puestoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Puestos]
                    PRIMARY KEY ([puestoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[TiposDocumento]
    (
        [tipoDocumentoId] INT NOT NULL IDENTITY,
        [tipoDocumentoNombre] VARCHAR(256) NOT NULL,
        [tipoDocumentoDescripcion] VARCHAR(256) NULL,
        [tipoDocumentoExtensionesPermitidas] VARCHAR(256) NULL,
        [tipoDocumentoTamanoMaximoMB] DECIMAL(10, 2) NULL,
        [tipoDocumentoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_TiposDocumento]
                    PRIMARY KEY ([tipoDocumentoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[TiposKpi]
    (
        [tipoKPIId] INT NOT NULL IDENTITY,
        [tipoKPINombre] VARCHAR(256) NOT NULL,
        [tipoKPIDescripcion] VARCHAR(256) NULL,
        [tipoKPIUnidad] VARCHAR(256) NULL,
        [tipoKPIFormato] VARCHAR(256) NULL,
        [tipoKPIActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_TiposKpi]
                    PRIMARY KEY ([tipoKPIId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[TiposMovimientoViatico]
    (
        [tipoMovimientoViaticoId] INT NOT NULL IDENTITY,
        [tipoMovimientoViaticoNombre] VARCHAR(256) NOT NULL,
        [tipoMovimientoViaticoDescripcion] VARCHAR(256) NULL,
        [tipoMovimientoViaticoAfectacion] INT NOT NULL,
        [tipoMovimientoViaticoRequiereComprobante] BIT NOT NULL,
        [tipoMovimientoViaticoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_TiposMovimientoViatico]
                    PRIMARY KEY ([tipoMovimientoViaticoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[TiposProyecto]
    (
        [tipoProyectoId] INT NOT NULL IDENTITY,
        [tipoProyectoNombre] VARCHAR(256) NOT NULL,
        [tipoProyectoDescripcion] VARCHAR(256) NULL,
        [tipoProyectoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_TiposProyecto]
                    PRIMARY KEY ([tipoProyectoId])
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [AspNetRoleClaims]
    (
        [Id] INT NOT NULL IDENTITY,
        [RoleId] INT NOT NULL,
        [ClaimType] VARCHAR(256) NULL,
        [ClaimValue] VARCHAR(256) NULL,
        CONSTRAINT [PK_AspNetRoleClaims]
                    PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId]
                    FOREIGN KEY ([RoleId])
                    REFERENCES [AspNetRoles] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Objetos]
    (
        [objetoId] INT NOT NULL IDENTITY,
        [objetoNombre] VARCHAR(256) NOT NULL,
        [objetoTipoId] INT NOT NULL,
        [menuId] INT NULL,
        [objetoActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Objetos]
                    PRIMARY KEY ([objetoId]),
        CONSTRAINT [FK_Objetos_Menus_menuId]
                    FOREIGN KEY ([menuId])
                    REFERENCES [dbo].[Menus] ([menuId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Objetos_objetos_tipo_objetoTipoId]
                    FOREIGN KEY ([objetoTipoId])
                    REFERENCES [dbo].[objetos_tipo] ([objetoTipoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Clientes]
    (
        [clienteId] INT NOT NULL IDENTITY,
        [clienteNombre] VARCHAR(256) NOT NULL,
        [clienteNombreComercial] VARCHAR(256) NULL,
        [clienteRFC] VARCHAR(256) NULL,
        [clienteDireccion] VARCHAR(256) NULL,
        [clienteTelefono] VARCHAR(256) NULL,
        [clienteEmail] VARCHAR(256) NULL,
        [clienteSitioWeb] VARCHAR(256) NULL,
        [clienteIndustria] VARCHAR(256) NULL,
        [clienteFechaAlta] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [clienteActivo] BIT NOT NULL,
        [objetoId] INT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Clientes]
                    PRIMARY KEY ([clienteId]),
        CONSTRAINT [FK_Clientes_Objetos_objetoId]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[empleados]
    (
        [empleadoId] INT NOT NULL IDENTITY,
        [empleadoNombre] VARCHAR(256) NOT NULL
            DEFAULT '',
        [empleadoApellidos] VARCHAR(256) NOT NULL
            DEFAULT '',
        [empleadoFechaNacimiento] DATETIME NULL,
        [empleadoEmail] VARCHAR(256) NOT NULL,
        [empleadoTelefono] VARCHAR(256) NOT NULL
            DEFAULT '',
        [empleadoMovil] VARCHAR(256) NOT NULL
            DEFAULT '',
        [puestoId] INT NULL,
        [empleadoActivo] BIT NOT NULL
            DEFAULT CAST(0 AS BIT),
        [objetoId] INT NOT NULL
            DEFAULT 6,
        [empleadoGenero] INT NOT NULL
            DEFAULT 0,
        [empleadoFechaIngreso] DATETIME NULL,
        [empleadoLicencia] BIT NOT NULL
            DEFAULT CAST(0 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_empleados]
                    PRIMARY KEY ([empleadoId]),
        CONSTRAINT [FK_empleados_objetos]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_empleados_puestos]
                    FOREIGN KEY ([puestoId])
                    REFERENCES [dbo].[Puestos] ([puestoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Perfiles]
    (
        [perfilId] INT NOT NULL IDENTITY,
        [perfilNombre] VARCHAR(256) NOT NULL,
        [perfilActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [objetoId] INT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Perfiles]
                    PRIMARY KEY ([perfilId]),
        CONSTRAINT [FK_Perfiles_Objetos_objetoId]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[ContactosCliente]
    (
        [contactoId] INT NOT NULL IDENTITY,
        [clienteId] INT NOT NULL,
        [contactoNombre] VARCHAR(256) NOT NULL,
        [contactoApellidos] VARCHAR(256) NOT NULL,
        [contactoPuesto] VARCHAR(256) NULL,
        [contactoEmail] VARCHAR(256) NULL,
        [contactoTelefono] VARCHAR(256) NULL,
        [contactoMovil] VARCHAR(256) NULL,
        [contactoEsPrincipal] BIT NOT NULL,
        [contactoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_ContactosCliente]
                    PRIMARY KEY ([contactoId]),
        CONSTRAINT [FK_ContactosCliente_Clientes_clienteId]
                    FOREIGN KEY ([clienteId])
                    REFERENCES [dbo].[Clientes] ([clienteId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[accesos]
    (
        [perfilId] INT NOT NULL,
        [objetoId] INT NOT NULL,
        [accesoActivo] BIT NOT NULL
            DEFAULT CAST(0 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        [Id] INT NOT NULL IDENTITY,
        CONSTRAINT [PK_accesos]
                    PRIMARY KEY ([perfilId], [objetoId]),
        CONSTRAINT [FK_accesos_Objetos_objetoId]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_accesos_Perfiles_perfilId]
                    FOREIGN KEY ([perfilId])
                    REFERENCES [dbo].[Perfiles] ([perfilId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Usuarios]
    (
        [usuarioId] INT NOT NULL IDENTITY,
        [usuarioApellidos] VARCHAR(256) NOT NULL,
        [usuarioToken] UNIQUEIDENTIFIER NULL,
        [usuarioActivo] BIT NOT NULL,
        [usuarioContrasenaRecuperacion] VARCHAR(256) NULL,
        [perfilId] INT NOT NULL,
        [empleadoId] INT NULL,
        [objetoId] INT NOT NULL,
        [usuarioNombre] VARCHAR(256) NULL,
        [usuarioEmail] VARCHAR(256) NULL,
        [usuarioMovil] VARCHAR(256) NULL,
        [passwordHash] VARCHAR(256) NULL,
        [securityStamp] VARCHAR(256) NULL,
        [concurrencyStamp] VARCHAR(256) NULL,
        [lockoutEnd] DATETIMEOFFSET NULL,
        [lockoutEnabled] BIT NOT NULL,
        [accessFailedCount] INT NOT NULL,
        [usuarioContrasena] VARBINARY(500) NULL,
        [usuarioNumero] INT NOT NULL,
        [NormalizedUserName] VARCHAR(256) NULL,
        [NormalizedEmail] VARCHAR(256) NULL,
        [EmailConfirmed] BIT NOT NULL,
        [phoneNumberConfirmed] BIT NOT NULL,
        [twoFactorEnabled] BIT NOT NULL,
        CONSTRAINT [PK_Usuarios]
                    PRIMARY KEY ([usuarioId]),
        CONSTRAINT [FK_Usuario_Objeto]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Usuario_Perfil]
                    FOREIGN KEY ([perfilId])
                    REFERENCES [dbo].[Perfiles] ([perfilId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Usuarios_empleados_empleadoId]
                    FOREIGN KEY ([empleadoId])
                    REFERENCES [dbo].[empleados] ([empleadoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [AspNetUserClaims]
    (
        [Id] INT NOT NULL IDENTITY,
        [UserId] INT NOT NULL,
        [ClaimType] VARCHAR(256) NULL,
        [ClaimValue] VARCHAR(256) NULL,
        CONSTRAINT [PK_AspNetUserClaims]
                    PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_Usuarios_UserId]
                    FOREIGN KEY ([UserId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [AspNetUserLogins]
    (
        [LoginProvider] NVARCHAR(450) NOT NULL,
        [ProviderKey] NVARCHAR(450) NOT NULL,
        [ProviderDisplayName] VARCHAR(256) NULL,
        [UserId] INT NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins]
                    PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_Usuarios_UserId]
                    FOREIGN KEY ([UserId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [AspNetUserRoles]
    (
        [UserId] INT NOT NULL,
        [RoleId] INT NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles]
                    PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId]
                    FOREIGN KEY ([RoleId])
                    REFERENCES [AspNetRoles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AspNetUserRoles_Usuarios_UserId]
                    FOREIGN KEY ([UserId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [AspNetUserTokens]
    (
        [UserId] INT NOT NULL,
        [LoginProvider] NVARCHAR(450) NOT NULL,
        [Name] NVARCHAR(450) NOT NULL,
        [Value] VARCHAR(256) NULL,
        CONSTRAINT [PK_AspNetUserTokens]
                    PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_Usuarios_UserId]
                    FOREIGN KEY ([UserId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Proyectos]
    (
        [proyectoId] INT NOT NULL IDENTITY,
        [proyectoNombre] VARCHAR(256) NOT NULL,
        [proyectoCodigo] VARCHAR(256) NULL,
        [proyectoDescripcion] VARCHAR(256) NULL,
        [proyectoFechaInicio] DATETIME NULL,
        [proyectoFechaFinPlanificada] DATETIME NULL,
        [proyectoFechaFinReal] DATETIME NULL,
        [estadoProyectoId] INT NOT NULL,
        [tipoProyectoId] INT NOT NULL,
        [clienteId] INT NOT NULL,
        [gerenteId] INT NOT NULL,
        [proyectoPresupuesto] DECIMAL(18, 2) NULL,
        [proyectoRetornoInversionObjetivo] DECIMAL(10, 2) NULL,
        [proyectoPorcentajeAvance] DECIMAL(5, 2) NULL,
        [proyectoActivo] BIT NOT NULL,
        [objetoId] INT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Proyectos]
                    PRIMARY KEY ([proyectoId]),
        CONSTRAINT [FK_Proyectos_Clientes_clienteId]
                    FOREIGN KEY ([clienteId])
                    REFERENCES [dbo].[Clientes] ([clienteId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Proyectos_EstadosProyecto_estadoProyectoId]
                    FOREIGN KEY ([estadoProyectoId])
                    REFERENCES [dbo].[EstadosProyecto] ([estadoProyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Proyectos_Objetos_objetoId]
                    FOREIGN KEY ([objetoId])
                    REFERENCES [dbo].[Objetos] ([objetoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Proyectos_TiposProyecto_tipoProyectoId]
                    FOREIGN KEY ([tipoProyectoId])
                    REFERENCES [dbo].[TiposProyecto] ([tipoProyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Proyectos_Usuarios_gerenteId]
                    FOREIGN KEY ([gerenteId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[RefreshTokens]
    (
        [refreshTokenId] INT NOT NULL IDENTITY,
        [refreshTokenCreadoPorIp] VARCHAR(256) NOT NULL,
        [refreshTokenFechaExpiracion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [refreshTokenFechaRevocacion] DATETIME NULL,
        [refreshTokenRazonRevocacion] VARCHAR(256) NULL,
        [refreshTokenReemplazadoPorToken] VARCHAR(256) NULL,
        [refreshTokenRevocado] BIT NOT NULL
            DEFAULT CAST(0 AS BIT),
        [refreshTokenToken] VARCHAR(256) NOT NULL,
        [usuarioId] INT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_RefreshTokens]
                    PRIMARY KEY ([refreshTokenId]),
        CONSTRAINT [FK_RefreshTokens_Usuarios_usuarioId]
                    FOREIGN KEY ([usuarioId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[UsuarioTokens]
    (
        [usuarioTokenId] INT NOT NULL IDENTITY,
        [usuarioTokenActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [usuarioTokenFechaExpiracion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [usuarioTokenToken] UNIQUEIDENTIFIER NOT NULL,
        [usuarioTokenUsado] BIT NOT NULL,
        [usuarioId] INT NOT NULL,
        [usuarioJwtId] UNIQUEIDENTIFIER NOT NULL,
        [usuarioTokenIpUso] VARCHAR(256) NULL,
        [usuarioTokenMotivoUso] VARCHAR(256) NULL,
        [usuarioTokenFechaUso] DATETIME NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_UsuarioTokens]
                    PRIMARY KEY ([usuarioTokenId]),
        CONSTRAINT [FK_UsuarioTokens_Usuarios_usuarioId]
                    FOREIGN KEY ([usuarioId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[AsignacionesViatico]
    (
        [asignacionViaticoId] INT NOT NULL IDENTITY,
        [proyectoId] INT NOT NULL,
        [empleadoId] INT NOT NULL,
        [asignacionViaticoConcepto] VARCHAR(256) NOT NULL,
        [asignacionViaticoMontoTotal] DECIMAL(18, 2) NOT NULL,
        [monedaId] INT NOT NULL,
        [asignacionViaticoFechaInicio] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [asignacionViaticoFechaFin] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [asignacionViaticoDestino] VARCHAR(256) NULL,
        [asignacionViaticoPropositoViaje] VARCHAR(256) NULL,
        [estadoAprobacionId] INT NOT NULL,
        [aprobadoPorId] INT NULL,
        [asignacionViaticoFechaAprobacion] DATETIME NULL,
        [asignacionViaticoEsLiquidada] BIT NOT NULL,
        [asignacionViaticoFechaLiquidacion] DATETIME NULL,
        [asignacionViaticoSaldoPendiente] DECIMAL(18, 2) NULL,
        [asignacionViaticoComentarios] VARCHAR(256) NULL,
        [asignacionViaticoActiva] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_AsignacionesViatico]
                    PRIMARY KEY ([asignacionViaticoId]),
        CONSTRAINT [FK_AsignacionesViatico_EstadosAprobacion_estadoAprobacionId]
                    FOREIGN KEY ([estadoAprobacionId])
                    REFERENCES [dbo].[EstadosAprobacion] ([estadoAprobacionId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AsignacionesViatico_Monedas_monedaId]
                    FOREIGN KEY ([monedaId])
                    REFERENCES [dbo].[Monedas] ([monedaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AsignacionesViatico_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AsignacionesViatico_Usuarios_aprobadoPorId]
                    FOREIGN KEY ([aprobadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AsignacionesViatico_empleados_empleadoId]
                    FOREIGN KEY ([empleadoId])
                    REFERENCES [dbo].[empleados] ([empleadoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[CarpetasDocumento]
    (
        [carpetaDocumentoId] INT NOT NULL IDENTITY,
        [carpetaDocumentoNombre] VARCHAR(256) NOT NULL,
        [carpetaDocumentoDescripcion] VARCHAR(256) NULL,
        [proyectoId] INT NOT NULL,
        [carpetaPadreId] INT NULL,
        [carpetaDocumentoFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [creadoPorId] INT NOT NULL,
        [carpetaDocumentoActiva] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_CarpetasDocumento]
                    PRIMARY KEY ([carpetaDocumentoId]),
        CONSTRAINT [FK_CarpetasDocumento_CarpetasDocumento_carpetaPadreId]
                    FOREIGN KEY ([carpetaPadreId])
                    REFERENCES [dbo].[CarpetasDocumento] ([carpetaDocumentoId]),
        CONSTRAINT [FK_CarpetasDocumento_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_CarpetasDocumento_Usuarios_creadoPorId]
                    FOREIGN KEY ([creadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[EtapasProyecto]
    (
        [etapaProyectoId] INT NOT NULL IDENTITY,
        [proyectoId] INT NOT NULL,
        [etapaProyectoNombre] VARCHAR(256) NOT NULL,
        [etapaProyectoDescripcion] VARCHAR(256) NULL,
        [etapaProyectoOrden] INT NOT NULL,
        [etapaProyectoFechaInicio] DATETIME NULL,
        [etapaProyectoFechaFin] DATETIME NULL,
        [etapaProyectoFechaInicioReal] DATETIME NULL,
        [etapaProyectoFechaFinReal] DATETIME NULL,
        [etapaProyectoPorcentajeCompletado] DECIMAL(5, 2) NULL,
        [estadoEtapaId] INT NOT NULL,
        [etapaProyectoEsPredefinida] BIT NOT NULL,
        [etapaProyectoActiva] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_EtapasProyecto]
                    PRIMARY KEY ([etapaProyectoId]),
        CONSTRAINT [FK_EtapasProyecto_EstadosEtapa_estadoEtapaId]
                    FOREIGN KEY ([estadoEtapaId])
                    REFERENCES [dbo].[EstadosEtapa] ([estadoEtapaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_EtapasProyecto_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Gastos]
    (
        [gastoId] INT NOT NULL IDENTITY,
        [gastoConcepto] VARCHAR(256) NOT NULL,
        [gastoMonto] DECIMAL(18, 2) NOT NULL,
        [gastoFecha] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [proyectoId] INT NOT NULL,
        [categoriaGastoId] INT NOT NULL,
        [empleadoId] INT NOT NULL,
        [monedaId] INT NOT NULL,
        [gastoTipoCambio] DECIMAL(18, 6) NULL,
        [gastoNumeroFactura] VARCHAR(256) NULL,
        [gastoProveedor] VARCHAR(256) NULL,
        [gastoProveedorRFC] VARCHAR(256) NULL,
        [gastoRutaComprobante] VARCHAR(256) NULL,
        [estadoAprobacionId] INT NOT NULL,
        [aprobadoPorId] INT NULL,
        [gastoFechaAprobacion] DATETIME NULL,
        [gastoComentarios] VARCHAR(256) NULL,
        [gastoEsReembolsable] BIT NOT NULL,
        [gastoActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Gastos]
                    PRIMARY KEY ([gastoId]),
        CONSTRAINT [FK_Gastos_CategoriasGasto_categoriaGastoId]
                    FOREIGN KEY ([categoriaGastoId])
                    REFERENCES [dbo].[CategoriasGasto] ([categoriaGastoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Gastos_EstadosAprobacion_estadoAprobacionId]
                    FOREIGN KEY ([estadoAprobacionId])
                    REFERENCES [dbo].[EstadosAprobacion] ([estadoAprobacionId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Gastos_Monedas_monedaId]
                    FOREIGN KEY ([monedaId])
                    REFERENCES [dbo].[Monedas] ([monedaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Gastos_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Gastos_Usuarios_aprobadoPorId]
                    FOREIGN KEY ([aprobadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]),
        CONSTRAINT [FK_Gastos_empleados_empleadoId]
                    FOREIGN KEY ([empleadoId])
                    REFERENCES [dbo].[empleados] ([empleadoId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[InformesSemanales]
    (
        [informeSemanalId] INT NOT NULL IDENTITY,
        [proyectoId] INT NOT NULL,
        [informeSemanalTitulo] VARCHAR(256) NOT NULL,
        [informeSemanalFechaInicio] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [informeSemanalFechaFin] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [informeSemanalNumeroSemana] INT NOT NULL,
        [informeSemanalResumenActividades] VARCHAR(256) NOT NULL,
        [informeSemanalLogros] VARCHAR(256) NULL,
        [informeSemanalProblemas] VARCHAR(256) NULL,
        [informeSemanalSoluciones] VARCHAR(256) NULL,
        [informeSemanalActividadesProximaSemana] VARCHAR(256) NULL,
        [informeSemanalPorcentajeAvance] DECIMAL(5, 2) NOT NULL,
        [informeSemanalComentarios] VARCHAR(256) NULL,
        [creadoPorId] INT NOT NULL,
        [informeSemanalFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [estadoAprobacionId] INT NOT NULL,
        [aprobadoPorId] INT NULL,
        [informeSemanalFechaAprobacion] DATETIME NULL,
        [informeSemanalActivo] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_InformesSemanales]
                    PRIMARY KEY ([informeSemanalId]),
        CONSTRAINT [FK_InformesSemanales_EstadosAprobacion_estadoAprobacionId]
                    FOREIGN KEY ([estadoAprobacionId])
                    REFERENCES [dbo].[EstadosAprobacion] ([estadoAprobacionId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_InformesSemanales_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_InformesSemanales_Usuarios_aprobadoPorId]
                    FOREIGN KEY ([aprobadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]),
        CONSTRAINT [FK_InformesSemanales_Usuarios_creadoPorId]
                    FOREIGN KEY ([creadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Kpis]
    (
        [kpiId] INT NOT NULL IDENTITY,
        [kpiNombre] VARCHAR(256) NOT NULL,
        [kpiDescripcion] VARCHAR(256) NULL,
        [tipoKPIId] INT NOT NULL,
        [kpiUnidad] VARCHAR(256) NULL,
        [kpiValorBase] DECIMAL(18, 4) NULL,
        [kpiValorObjetivo] DECIMAL(18, 4) NULL,
        [kpiValorMinimo] DECIMAL(18, 4) NULL,
        [proyectoId] INT NOT NULL,
        [frecuenciaMedicionId] INT NOT NULL,
        [kpiFechaInicio] DATETIME NULL,
        [kpiFechaFin] DATETIME NULL,
        [kpiActivo] BIT NOT NULL,
        [creadoPorId] INT NOT NULL,
        [kpiFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [kpiEsOperativo] BIT NOT NULL,
        [kpiEsFinanciero] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Kpis]
                    PRIMARY KEY ([kpiId]),
        CONSTRAINT [FK_Kpis_FrecuenciasMedicion_frecuenciaMedicionId]
                    FOREIGN KEY ([frecuenciaMedicionId])
                    REFERENCES [dbo].[FrecuenciasMedicion] ([frecuenciaMedicionId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Kpis_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Kpis_TiposKpi_tipoKPIId]
                    FOREIGN KEY ([tipoKPIId])
                    REFERENCES [dbo].[TiposKpi] ([tipoKPIId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Kpis_Usuarios_creadoPorId]
                    FOREIGN KEY ([creadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[MovimientosViatico]
    (
        [movimientoViaticoId] INT NOT NULL IDENTITY,
        [asignacionViaticoId] INT NOT NULL,
        [tipoMovimientoViaticoId] INT NOT NULL,
        [movimientoViaticoConcepto] VARCHAR(256) NOT NULL,
        [movimientoViaticoMonto] DECIMAL(18, 2) NOT NULL,
        [movimientoViaticoFecha] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [categoriaGastoId] INT NULL,
        [movimientoViaticoRutaComprobante] VARCHAR(256) NULL,
        [registradoPorId] INT NOT NULL,
        [movimientoViaticoFechaRegistro] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [movimientoViaticoComentarios] VARCHAR(256) NULL,
        [movimientoViaticoActivo] BIT NOT NULL
            DEFAULT CAST(1 AS BIT),
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_MovimientosViatico]
                    PRIMARY KEY ([movimientoViaticoId]),
        CONSTRAINT [FK_MovimientosViatico_AsignacionesViatico_asignacionViaticoId]
                    FOREIGN KEY ([asignacionViaticoId])
                    REFERENCES [dbo].[AsignacionesViatico] ([asignacionViaticoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MovimientosViatico_CategoriasGasto_categoriaGastoId]
                    FOREIGN KEY ([categoriaGastoId])
                    REFERENCES [dbo].[CategoriasGasto] ([categoriaGastoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MovimientosViatico_TiposMovimientoViatico_tipoMovimientoViaticoId]
                    FOREIGN KEY ([tipoMovimientoViaticoId])
                    REFERENCES [dbo].[TiposMovimientoViatico] ([tipoMovimientoViaticoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MovimientosViatico_Usuarios_registradoPorId]
                    FOREIGN KEY ([registradoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Documentos]
    (
        [documentoId] INT NOT NULL IDENTITY,
        [documentoNombre] VARCHAR(256) NOT NULL,
        [documentoDescripcion] VARCHAR(256) NULL,
        [documentoRutaAlmacenamiento] VARCHAR(256) NOT NULL,
        [documentoNombreArchivo] VARCHAR(256) NOT NULL,
        [documentoExtension] VARCHAR(256) NULL,
        [tipoDocumentoId] INT NOT NULL,
        [documentoTamano] BIGINT NULL,
        [documentoFechaSubida] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [documentoFechaModificacion] DATETIME NULL,
        [documentoVersionActual] INT NOT NULL,
        [proyectoId] INT NOT NULL,
        [etapaProyectoId] INT NULL,
        [carpetaDocumentoId] INT NULL,
        [subidoPorId] INT NOT NULL,
        [documentoEsPublico] BIT NOT NULL,
        [documentoEtiquetas] VARCHAR(256) NULL,
        [documentoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        CONSTRAINT [PK_Documentos]
                    PRIMARY KEY ([documentoId]),
        CONSTRAINT [FK_Documentos_CarpetasDocumento_carpetaDocumentoId]
                    FOREIGN KEY ([carpetaDocumentoId])
                    REFERENCES [dbo].[CarpetasDocumento] ([carpetaDocumentoId]),
        CONSTRAINT [FK_Documentos_EtapasProyecto_etapaProyectoId]
                    FOREIGN KEY ([etapaProyectoId])
                    REFERENCES [dbo].[EtapasProyecto] ([etapaProyectoId]),
        CONSTRAINT [FK_Documentos_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Documentos_TiposDocumento_tipoDocumentoId]
                    FOREIGN KEY ([tipoDocumentoId])
                    REFERENCES [dbo].[TiposDocumento] ([tipoDocumentoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Documentos_Usuarios_subidoPorId]
                    FOREIGN KEY ([subidoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[Tareas]
    (
        [tareaId] INT NOT NULL IDENTITY,
        [tareaTitulo] VARCHAR(256) NOT NULL,
        [tareaDescripcion] VARCHAR(256) NULL,
        [proyectoId] INT NOT NULL,
        [etapaProyectoId] INT NULL,
        [estadoTareaId] INT NOT NULL,
        [prioridadTareaId] INT NOT NULL,
        [tareaFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [tareaFechaVencimiento] DATETIME NULL,
        [tareaFechaCompletada] DATETIME NULL,
        [tareaPorcentajeCompletado] DECIMAL(5, 2) NULL,
        [creadoPorId] INT NOT NULL,
        [asignadoAId] INT NULL,
        [tareaEsRecordatorio] BIT NOT NULL,
        [tareaFechaRecordatorio] DATETIME NULL,
        [tareaEsPrivada] BIT NOT NULL,
        [tareaTieneArchivosAdjuntos] BIT NOT NULL,
        [tareaActiva] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_Tareas]
                    PRIMARY KEY ([tareaId]),
        CONSTRAINT [FK_Tareas_EstadosTarea_estadoTareaId]
                    FOREIGN KEY ([estadoTareaId])
                    REFERENCES [dbo].[EstadosTarea] ([estadoTareaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Tareas_EtapasProyecto_etapaProyectoId]
                    FOREIGN KEY ([etapaProyectoId])
                    REFERENCES [dbo].[EtapasProyecto] ([etapaProyectoId]),
        CONSTRAINT [FK_Tareas_PrioridadesTarea_prioridadTareaId]
                    FOREIGN KEY ([prioridadTareaId])
                    REFERENCES [dbo].[PrioridadesTarea] ([prioridadTareaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Tareas_Proyectos_proyectoId]
                    FOREIGN KEY ([proyectoId])
                    REFERENCES [dbo].[Proyectos] ([proyectoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Tareas_Usuarios_asignadoAId]
                    FOREIGN KEY ([asignadoAId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]),
        CONSTRAINT [FK_Tareas_Usuarios_creadoPorId]
                    FOREIGN KEY ([creadoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[MedicionesKpi]
    (
        [medicionKPIId] INT NOT NULL IDENTITY,
        [kpiId] INT NOT NULL,
        [medicionKPIValor] DECIMAL(18, 4) NOT NULL,
        [medicionKPIFecha] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [medicionKPIPeriodo] VARCHAR(256) NULL,
        [medicionKPIComentarios] VARCHAR(256) NULL,
        [usuarioId] INT NOT NULL,
        [medicionKPIFechaRegistro] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [medicionKPIActiva] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_MedicionesKpi]
                    PRIMARY KEY ([medicionKPIId]),
        CONSTRAINT [FK_MedicionesKpi_Kpis_kpiId]
                    FOREIGN KEY ([kpiId])
                    REFERENCES [dbo].[Kpis] ([kpiId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MedicionesKpi_Usuarios_usuarioId]
                    FOREIGN KEY ([usuarioId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[VersionesDocumento]
    (
        [versionDocumentoId] INT NOT NULL IDENTITY,
        [documentoId] INT NOT NULL,
        [versionDocumentoNumero] INT NOT NULL,
        [versionDocumentoRutaAlmacenamiento] VARCHAR(256) NOT NULL,
        [versionDocumentoTamano] BIGINT NULL,
        [versionDocumentoFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [versionDocumentoComentario] VARCHAR(256) NULL,
        [usuarioId] INT NOT NULL,
        [versionDocumentoEsVersionActual] BIT NOT NULL,
        [versionDocumentoActiva] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_VersionesDocumento]
                    PRIMARY KEY ([versionDocumentoId]),
        CONSTRAINT [FK_VersionesDocumento_Documentos_documentoId]
                    FOREIGN KEY ([documentoId])
                    REFERENCES [dbo].[Documentos] ([documentoId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_VersionesDocumento_Usuarios_usuarioId]
                    FOREIGN KEY ([usuarioId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[ComentariosTarea]
    (
        [comentarioId] INT NOT NULL IDENTITY,
        [tareaId] INT NOT NULL,
        [usuarioId] INT NOT NULL,
        [comentarioContenido] VARCHAR(256) NOT NULL,
        [comentarioFechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [comentarioTieneArchivosAdjuntos] BIT NOT NULL,
        [comentarioActivo] BIT NOT NULL,
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_ComentariosTarea]
                    PRIMARY KEY ([comentarioId]),
        CONSTRAINT [FK_ComentariosTarea_Tareas_tareaId]
                    FOREIGN KEY ([tareaId])
                    REFERENCES [dbo].[Tareas] ([tareaId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ComentariosTarea_Usuarios_usuarioId]
                    FOREIGN KEY ([usuarioId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE TABLE [dbo].[ArchivosAdjuntos]
    (
        [archivoAdjuntoId] INT NOT NULL IDENTITY,
        [tareaId] INT NULL,
        [comentarioId] INT NULL,
        [archivoAdjuntoNombre] VARCHAR(256) NOT NULL,
        [archivoAdjuntoRutaAlmacenamiento] VARCHAR(256) NOT NULL,
        [archivoAdjuntoExtension] VARCHAR(256) NULL,
        [archivoAdjuntoTamano] BIGINT NULL,
        [archivoAdjuntoFechaSubida] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [subidoPorId] INT NOT NULL,
        [archivoAdjuntoActivo] BIT NOT NULL,
        [fechaCreacion] DATETIME NOT NULL
            DEFAULT GETDATE(),
        [fechaModificacion] DATETIME NULL,
        CONSTRAINT [PK_ArchivosAdjuntos]
                    PRIMARY KEY ([archivoAdjuntoId]),
        CONSTRAINT [FK_ArchivosAdjuntos_ComentariosTarea_comentarioId]
                    FOREIGN KEY ([comentarioId])
                    REFERENCES [dbo].[ComentariosTarea] ([comentarioId]),
        CONSTRAINT [FK_ArchivosAdjuntos_Tareas_tareaId]
                    FOREIGN KEY ([tareaId])
                    REFERENCES [dbo].[Tareas] ([tareaId]),
        CONSTRAINT [FK_ArchivosAdjuntos_Usuarios_subidoPorId]
                    FOREIGN KEY ([subidoPorId])
                    REFERENCES [dbo].[Usuarios] ([usuarioId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_accesos_objetoId]
            ON [dbo].[accesos] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_accesos_perfilId_objetoId]
            ON [dbo].[accesos] ([perfilId], [objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_ArchivosAdjuntos_comentarioId]
            ON [dbo].[ArchivosAdjuntos] ([comentarioId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_ArchivosAdjuntos_subidoPorId]
            ON [dbo].[ArchivosAdjuntos] ([subidoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_ArchivosAdjuntos_tareaId]
            ON [dbo].[ArchivosAdjuntos] ([tareaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_AsignacionesViatico_aprobadoPorId]
            ON [dbo].[AsignacionesViatico] ([aprobadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_AsignacionesViatico_empleadoId]
            ON [dbo].[AsignacionesViatico] ([empleadoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_AsignacionesViatico_estadoAprobacionId]
            ON [dbo].[AsignacionesViatico] ([estadoAprobacionId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_AsignacionesViatico_monedaId]
            ON [dbo].[AsignacionesViatico] ([monedaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_AsignacionesViatico_proyectoId]
            ON [dbo].[AsignacionesViatico] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_AspNetRoleClaims_RoleId]
            ON [AspNetRoleClaims] ([RoleId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    EXEC (N'CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_AspNetUserClaims_UserId]
            ON [AspNetUserClaims] ([UserId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_AspNetUserLogins_UserId]
            ON [AspNetUserLogins] ([UserId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_AspNetUserRoles_RoleId]
            ON [AspNetUserRoles] ([RoleId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_CarpetasDocumento_carpetaPadreId]
            ON [dbo].[CarpetasDocumento] ([carpetaPadreId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_CarpetasDocumento_creadoPorId]
            ON [dbo].[CarpetasDocumento] ([creadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_CarpetasDocumento_proyectoId]
            ON [dbo].[CarpetasDocumento] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Clientes_objetoId]
            ON [dbo].[Clientes] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_ComentariosTarea_tareaId]
            ON [dbo].[ComentariosTarea] ([tareaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_ComentariosTarea_usuarioId]
            ON [dbo].[ComentariosTarea] ([usuarioId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_ContactosCliente_clienteId]
            ON [dbo].[ContactosCliente] ([clienteId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Documentos_carpetaDocumentoId]
            ON [dbo].[Documentos] ([carpetaDocumentoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Documentos_etapaProyectoId]
            ON [dbo].[Documentos] ([etapaProyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Documentos_proyectoId]
            ON [dbo].[Documentos] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Documentos_subidoPorId]
            ON [dbo].[Documentos] ([subidoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Documentos_tipoDocumentoId]
            ON [dbo].[Documentos] ([tipoDocumentoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Empleados_ObjetoId]
            ON [dbo].[empleados] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Empleados_PuestoId]
            ON [dbo].[empleados] ([puestoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_EtapasProyecto_estadoEtapaId]
            ON [dbo].[EtapasProyecto] ([estadoEtapaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_EtapasProyecto_proyectoId]
            ON [dbo].[EtapasProyecto] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_aprobadoPorId]
            ON [dbo].[Gastos] ([aprobadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_categoriaGastoId]
            ON [dbo].[Gastos] ([categoriaGastoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_empleadoId]
            ON [dbo].[Gastos] ([empleadoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_estadoAprobacionId]
            ON [dbo].[Gastos] ([estadoAprobacionId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_monedaId]
            ON [dbo].[Gastos] ([monedaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Gastos_proyectoId]
            ON [dbo].[Gastos] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_InformesSemanales_aprobadoPorId]
            ON [dbo].[InformesSemanales] ([aprobadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_InformesSemanales_creadoPorId]
            ON [dbo].[InformesSemanales] ([creadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_InformesSemanales_estadoAprobacionId]
            ON [dbo].[InformesSemanales] ([estadoAprobacionId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_InformesSemanales_proyectoId]
            ON [dbo].[InformesSemanales] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Kpis_creadoPorId]
            ON [dbo].[Kpis] ([creadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Kpis_frecuenciaMedicionId]
            ON [dbo].[Kpis] ([frecuenciaMedicionId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Kpis_proyectoId]
            ON [dbo].[Kpis] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Kpis_tipoKPIId]
            ON [dbo].[Kpis] ([tipoKPIId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_MedicionesKpi_kpiId]
            ON [dbo].[MedicionesKpi] ([kpiId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_MedicionesKpi_usuarioId]
            ON [dbo].[MedicionesKpi] ([usuarioId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Menus_menuPadreId]
            ON [dbo].[Menus] ([menuPadreId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_Monedas_monedaCodigo]
            ON [dbo].[Monedas] ([monedaCodigo]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_MovimientosViatico_asignacionViaticoId]
            ON [dbo].[MovimientosViatico] ([asignacionViaticoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_MovimientosViatico_categoriaGastoId]
            ON [dbo].[MovimientosViatico] ([categoriaGastoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_MovimientosViatico_registradoPorId]
            ON [dbo].[MovimientosViatico] ([registradoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_MovimientosViatico_tipoMovimientoViaticoId]
            ON [dbo].[MovimientosViatico] ([tipoMovimientoViaticoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Objetos_MenuId]
            ON [dbo].[Objetos] ([menuId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_Objetos_objetoNombre]
            ON [dbo].[Objetos] ([objetoNombre]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Objetos_objetoTipoId]
            ON [dbo].[Objetos] ([objetoTipoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_objetos_tipo_objetoTipoNombre]
            ON [dbo].[objetos_tipo] ([objetoTipoNombre]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Perfiles_objetoId]
            ON [dbo].[Perfiles] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE UNIQUE INDEX [IX_Perfiles_perfilNombre]
            ON [dbo].[Perfiles] ([perfilNombre]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Proyectos_clienteId]
            ON [dbo].[Proyectos] ([clienteId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Proyectos_estadoProyectoId]
            ON [dbo].[Proyectos] ([estadoProyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Proyectos_gerenteId]
            ON [dbo].[Proyectos] ([gerenteId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Proyectos_objetoId]
            ON [dbo].[Proyectos] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Proyectos_tipoProyectoId]
            ON [dbo].[Proyectos] ([tipoProyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_asignadoAId]
            ON [dbo].[Tareas] ([asignadoAId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_creadoPorId]
            ON [dbo].[Tareas] ([creadoPorId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_estadoTareaId]
            ON [dbo].[Tareas] ([estadoTareaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_etapaProyectoId]
            ON [dbo].[Tareas] ([etapaProyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_prioridadTareaId]
            ON [dbo].[Tareas] ([prioridadTareaId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Tareas_proyectoId]
            ON [dbo].[Tareas] ([proyectoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [EmailIndex]
            ON [dbo].[Usuarios] ([NormalizedEmail]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    EXEC (N'CREATE UNIQUE INDEX [IX_Usuarios_empleadoId] ON [dbo].[Usuarios] ([empleadoId]) WHERE [empleadoId] IS NOT NULL');
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Usuarios_ObjetoId]
            ON [dbo].[Usuarios] ([objetoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_Usuarios_PerfilId]
            ON [dbo].[Usuarios] ([perfilId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    EXEC (N'CREATE UNIQUE INDEX [IX_Usuarios_usuarioEmail] ON [dbo].[Usuarios] ([usuarioEmail]) WHERE [usuarioEmail] IS NOT NULL');
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    EXEC (N'CREATE UNIQUE INDEX [UserNameIndex] ON [dbo].[Usuarios] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_VersionesDocumento_documentoId]
            ON [dbo].[VersionesDocumento] ([documentoId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    CREATE INDEX [IX_VersionesDocumento_usuarioId]
            ON [dbo].[VersionesDocumento] ([usuarioId]);
END;

IF NOT EXISTS
    (
        SELECT
    *
FROM
    [__EFMigrationsHistory]
WHERE
            [MigrationId] = N'20250610075352_UpdateModelWithEntities'
    )
    BEGIN
    INSERT INTO [__EFMigrationsHistory]
        (
        [MigrationId],
        [ProductVersion]
        )
    VALUES
        (
            N'20250610075352_UpdateModelWithEntities', N'9.0.5'
            );
END;

COMMIT;
GO

