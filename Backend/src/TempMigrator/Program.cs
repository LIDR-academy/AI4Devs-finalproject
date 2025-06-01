using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

// Crear un StringBuilder para almacenar los logs
var logBuilder = new StringBuilder();

// Función para escribir en el log y en la consola
void Log(string message)
{
    Console.WriteLine(message);
    logBuilder.AppendLine(message);
}

try
{
    Log("Iniciando proceso de creación de tablas...");
    
    var configuration = new ConfigurationBuilder()
        .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
        .Build();

    var connectionString = configuration.GetConnectionString("DefaultConnection");
    Log($"Conectando a la base de datos...");

    using (var connection = new SqlConnection(connectionString))
    {
        connection.Open();
        Log("Conexión establecida correctamente.");

        // Listar las tablas existentes
        var existingTables = new List<string>();
        using (var command = new SqlCommand("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'", connection))
        using (var reader = command.ExecuteReader())
        {
            while (reader.Read())
            {
                existingTables.Add(reader.GetString(0));
            }
        }

        Log($"Tablas existentes antes de la creación: {string.Join(", ", existingTables)}");

        // Crear las tablas de catálogos si no existen
        var catalogTables = new List<string>
        {
            "EstadosProyecto",
            "EstadosEtapa",
            "EstadosTarea",
            "PrioridadesTarea",
            "TiposProyecto",
            "TiposDocumento",
            "TiposKPI",
            "FrecuenciasMedicion",
            "CategoriasGasto",
            "EstadosAprobacion",
            "Monedas",
            "TiposMovimientoViatico"
        };

        Log("Creando tablas de catálogos...");
        foreach (var table in catalogTables)
        {
            if (!existingTables.Contains(table))
            {
                Log($"Creando tabla {table}...");
                string createTableSql = GetCreateTableSql(table);
                using (var command = new SqlCommand(createTableSql, connection))
                {
                    command.ExecuteNonQuery();
                }
                Log($"Tabla {table} creada correctamente.");
            }
            else
            {
                Log($"La tabla {table} ya existe.");
            }
        }

        // Crear las tablas principales si no existen
        Log("\nCreando tablas principales...");
        var mainTables = new List<string>
        {
            "Proyectos",
            "Clientes",
            "ContactosCliente",
            "EtapasProyecto",
            "Tareas",
            "ComentariosTarea",
            "ArchivosAdjuntos",
            "Documentos",
            "VersionesDocumento",
            "CarpetasDocumento",
            "KPIs",
            "MedicionesKPI",
            "Gastos",
            "AsignacionesViatico",
            "MovimientosViatico",
            "InformesSemanales"
        };

        foreach (var table in mainTables)
        {
            if (!existingTables.Contains(table))
            {
                Log($"Creando tabla {table}...");
                string createTableSql = GetCreateTableSql(table);
                using (var command = new SqlCommand(createTableSql, connection))
                {
                    command.ExecuteNonQuery();
                }
                Log($"Tabla {table} creada correctamente.");
            }
            else
            {
                Log($"La tabla {table} ya existe.");
            }
        }

        // Listar las tablas después de la creación
        existingTables.Clear();
        using (var command = new SqlCommand("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'", connection))
        using (var reader = command.ExecuteReader())
        {
            while (reader.Read())
            {
                existingTables.Add(reader.GetString(0));
            }
        }

        Log($"\nTablas existentes después de la creación: {string.Join(", ", existingTables)}");
    }

    Log("Proceso completado correctamente.");
}
catch (Exception ex)
{
    Log($"Error: {ex.Message}");
    Log($"StackTrace: {ex.StackTrace}");
    if (ex.InnerException != null)
    {
        Log($"Inner Exception: {ex.InnerException.Message}");
    }
}
finally
{
    // Guardar el log en un archivo
    string logFilePath = Path.Combine(Directory.GetCurrentDirectory(), $"migration_log_{DateTime.Now:yyyyMMdd_HHmmss}.txt");
    File.WriteAllText(logFilePath, logBuilder.ToString());
    Log($"Log guardado en: {logFilePath}");
}

static string GetCreateTableSql(string tableName)
{
    switch (tableName)
    {
        case "estados_proyecto":
            return @"
                CREATE TABLE [dbo].[estados_proyecto] (
                    [estadoProyectoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [estadoProyectoNombre] NVARCHAR(50) NOT NULL,
                    [estadoProyectoDescripcion] NVARCHAR(200) NULL,
                    [estadoProyectoColor] NVARCHAR(7) NULL,
                    [estadoProyectoOrden] INT NOT NULL,
                    [estadoProyectoEsFinal] BIT NOT NULL,
                    [estadoProyectoActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "estados_etapa":
            return @"
                CREATE TABLE [dbo].[estados_etapa] (
                    [estadoEtapaId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [estadoEtapaNombre] NVARCHAR(50) NOT NULL,
                    [estadoEtapaDescripcion] NVARCHAR(200) NULL,
                    [estadoEtapaColor] NVARCHAR(7) NULL,
                    [estadoEtapaOrden] INT NOT NULL,
                    [estadoEtapaEsFinal] BIT NOT NULL,
                    [estadoEtapaActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "estados_tarea":
            return @"
                CREATE TABLE [dbo].[estados_tarea] (
                    [estadoTareaId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [estadoTareaNombre] NVARCHAR(50) NOT NULL,
                    [estadoTareaDescripcion] NVARCHAR(200) NULL,
                    [estadoTareaColor] NVARCHAR(7) NULL,
                    [estadoTareaOrden] INT NOT NULL,
                    [estadoTareaEsFinal] BIT NOT NULL,
                    [estadoTareaActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "prioridades_tarea":
            return @"
                CREATE TABLE [dbo].[prioridades_tarea] (
                    [prioridadTareaId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [prioridadTareaNombre] NVARCHAR(50) NOT NULL,
                    [prioridadTareaDescripcion] NVARCHAR(200) NULL,
                    [prioridadTareaColor] NVARCHAR(7) NULL,
                    [prioridadTareaNivel] INT NOT NULL,
                    [prioridadTareaActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "tipos_proyecto":
            return @"
                CREATE TABLE [dbo].[tipos_proyecto] (
                    [tipoProyectoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [tipoProyectoNombre] NVARCHAR(50) NOT NULL,
                    [tipoProyectoDescripcion] NVARCHAR(200) NULL,
                    [tipoProyectoActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "tipos_documento":
            return @"
                CREATE TABLE [dbo].[tipos_documento] (
                    [tipoDocumentoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [tipoDocumentoNombre] NVARCHAR(50) NOT NULL,
                    [tipoDocumentoDescripcion] NVARCHAR(200) NULL,
                    [tipoDocumentoExtensionesPermitidas] NVARCHAR(200) NULL,
                    [tipoDocumentoTamanoMaximoMB] DECIMAL(10, 2) NULL,
                    [tipoDocumentoActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "tipos_kpi":
            return @"
                CREATE TABLE [dbo].[tipos_kpi] (
                    [tipoKPIId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [tipoKPINombre] NVARCHAR(50) NOT NULL,
                    [tipoKPIDescripcion] NVARCHAR(200) NULL,
                    [tipoKPIActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "frecuencias_medicion":
            return @"
                CREATE TABLE [dbo].[frecuencias_medicion] (
                    [frecuenciaMedicionId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [frecuenciaMedicionNombre] NVARCHAR(50) NOT NULL,
                    [frecuenciaMedicionDescripcion] NVARCHAR(200) NULL,
                    [frecuenciaMedicionDias] INT NOT NULL,
                    [frecuenciaMedicionActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "categorias_gasto":
            return @"
                CREATE TABLE [dbo].[categorias_gasto] (
                    [categoriaGastoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [categoriaGastoNombre] NVARCHAR(50) NOT NULL,
                    [categoriaGastoDescripcion] NVARCHAR(200) NULL,
                    [categoriaGastoActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "estados_aprobacion":
            return @"
                CREATE TABLE [dbo].[estados_aprobacion] (
                    [estadoAprobacionId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [estadoAprobacionNombre] NVARCHAR(50) NOT NULL,
                    [estadoAprobacionDescripcion] NVARCHAR(200) NULL,
                    [estadoAprobacionColor] NVARCHAR(7) NULL,
                    [estadoAprobacionActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "monedas":
            return @"
                CREATE TABLE [dbo].[monedas] (
                    [monedaId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [monedaNombre] NVARCHAR(50) NOT NULL,
                    [monedaCodigo] NVARCHAR(3) NOT NULL,
                    [monedaSimbolo] NVARCHAR(5) NOT NULL,
                    [monedaActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "tipos_movimiento_viatico":
            return @"
                CREATE TABLE [dbo].[tipos_movimiento_viatico] (
                    [tipoMovimientoViaticoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [tipoMovimientoViaticoNombre] NVARCHAR(50) NOT NULL,
                    [tipoMovimientoViaticoDescripcion] NVARCHAR(200) NULL,
                    [tipoMovimientoViaticoAfectacion] NVARCHAR(10) NOT NULL,
                    [tipoMovimientoViaticoActivo] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                )";

        case "proyectos":
            return @"
                CREATE TABLE [dbo].[proyectos] (
                    [proyectoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [proyectoNombre] NVARCHAR(100) NOT NULL,
                    [proyectoCodigo] NVARCHAR(20) NULL,
                    [proyectoDescripcion] NVARCHAR(500) NULL,
                    [proyectoFechaInicio] DATETIME2 NULL,
                    [proyectoFechaFinPlanificada] DATETIME2 NULL,
                    [proyectoFechaFinReal] DATETIME2 NULL,
                    [estadoProyectoId] INT NOT NULL,
                    [tipoProyectoId] INT NOT NULL,
                    [clienteId] INT NOT NULL,
                    [gerenteId] INT NOT NULL,
                    [proyectoPresupuesto] DECIMAL(18, 2) NULL,
                    [proyectoROIObjetivo] DECIMAL(18, 2) NULL DEFAULT 3.0,
                    [proyectoPorcentajeAvance] DECIMAL(5, 2) NULL DEFAULT 0,
                    [proyectoActivo] BIT NOT NULL DEFAULT 1,
                    [objetoId] INT NOT NULL DEFAULT 3,
                    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                    CONSTRAINT [FK_Proyectos_EstadosProyecto] FOREIGN KEY ([estadoProyectoId]) REFERENCES [dbo].[estados_proyecto] ([estadoProyectoId]),
                    CONSTRAINT [FK_Proyectos_TiposProyecto] FOREIGN KEY ([tipoProyectoId]) REFERENCES [dbo].[tipos_proyecto] ([tipoProyectoId]),
                    CONSTRAINT [FK_Proyectos_Objetos] FOREIGN KEY ([objetoId]) REFERENCES [dbo].[objetos] ([objetoId])
                )";

        // Agrega el resto de las tablas principales
        
        default:
            return $"-- No se ha definido el script SQL para la tabla {tableName}";
    }
}
