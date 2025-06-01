using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace TempMigrator
{
    public class CrearTablas
    {
        private static StringBuilder logBuilder = new StringBuilder();
        private static string logFilePath;

        public static void Log(string message)
        {
            string logMessage = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}";
            Console.WriteLine(logMessage);
            logBuilder.AppendLine(logMessage);
        }

        public static void EjecutarCreacionTablas()
        {
            try
            {
                Log("Iniciando proceso de creación de tablas...");
                
                var configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .Build();

                var connectionString = configuration.GetConnectionString("DefaultConnection");
                Log($"Conectando a la base de datos con cadena: {connectionString}");

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
                            existingTables.Add(reader.GetString(0).ToLower());
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

                    // Verificar si existe la tabla objetos (necesaria para las relaciones)
                    if (!existingTables.Contains("objetos") && !existingTables.Contains("Objetos"))
                    {
                        Log("Creando tabla Objetos (necesaria para las relaciones)...");
                        string objetosTableSql = @"
                            CREATE TABLE [dbo].[Objetos] (
                                [objetoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                                [objetoNombre] NVARCHAR(50) NOT NULL,
                                [objetoDescripcion] NVARCHAR(200) NULL,
                                [objetoActivo] BIT NOT NULL DEFAULT 1,
                                [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                                [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                            )";
                        using (var command = new SqlCommand(objetosTableSql, connection))
                        {
                            command.ExecuteNonQuery();
                        }
                        Log("Tabla Objetos creada correctamente.");
                        
                        // Insertar el objeto para proyectos
                        string insertObjetoProyectoSql = @"
                            INSERT INTO [dbo].[Objetos] (objetoNombre, objetoDescripcion, objetoActivo)
                            VALUES ('Proyecto', 'Objeto para proyectos', 1)";
                        using (var command = new SqlCommand(insertObjetoProyectoSql, connection))
                        {
                            command.ExecuteNonQuery();
                        }
                        Log("Objeto para proyectos insertado correctamente.");
                    }

                    // Crear las tablas principales si no existen
                    Log("\nCreando tablas principales...");
                    
                    // Crear tabla Clientes primero (necesaria para la relación con proyectos)
                    if (!existingTables.Contains("clientes") && !existingTables.Contains("Clientes"))
                    {
                        Log("Creando tabla Clientes...");
                        string clientesTableSql = @"
                            CREATE TABLE [dbo].[Clientes] (
                                [clienteId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                                [clienteNombre] NVARCHAR(100) NOT NULL,
                                [clienteDireccion] NVARCHAR(255) NULL,
                                [clienteTelefono] NVARCHAR(20) NULL,
                                [clienteEmail] NVARCHAR(100) NULL,
                                [clienteNotas] NVARCHAR(MAX) NULL,
                                [clienteActivo] BIT NOT NULL DEFAULT 1,
                                [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                                [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                            )";
                        using (var command = new SqlCommand(clientesTableSql, connection))
                        {
                            command.ExecuteNonQuery();
                        }
                        Log("Tabla Clientes creada correctamente.");
                    }
                    
                    // Crear tabla Proyectos
                    if (!existingTables.Contains("proyectos") && !existingTables.Contains("Proyectos"))
                    {
                        Log("Creando tabla Proyectos...");
                        string proyectosTableSql = @"
                            CREATE TABLE [dbo].[Proyectos] (
                                [proyectoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                                [proyectoNombre] NVARCHAR(100) NOT NULL,
                                [proyectoCodigo] NVARCHAR(20) NULL,
                                [proyectoDescripcion] NVARCHAR(500) NULL,
                                [proyectoFechaInicio] DATETIME2 NULL,
                                [proyectoFechaFinPlanificada] DATETIME2 NULL,
                                [proyectoFechaFinReal] DATETIME2 NULL,
                                [estadoProyectoId] INT NULL,
                                [tipoProyectoId] INT NULL,
                                [clienteId] INT NULL,
                                [gerenteId] INT NULL,
                                [proyectoPresupuesto] DECIMAL(18, 2) NULL,
                                [proyectoROIObjetivo] DECIMAL(18, 2) NULL DEFAULT 3.0,
                                [proyectoPorcentajeAvance] DECIMAL(5, 2) NULL DEFAULT 0,
                                [proyectoActivo] BIT NOT NULL DEFAULT 1,
                                [objetoId] INT NULL DEFAULT 3,
                                [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                                [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                                CONSTRAINT [FK_Proyectos_EstadosProyecto] FOREIGN KEY ([estadoProyectoId]) REFERENCES [dbo].[EstadosProyecto] ([estadoProyectoId]),
                                CONSTRAINT [FK_Proyectos_TiposProyecto] FOREIGN KEY ([tipoProyectoId]) REFERENCES [dbo].[TiposProyecto] ([tipoProyectoId]),
                                CONSTRAINT [FK_Proyectos_Clientes] FOREIGN KEY ([clienteId]) REFERENCES [dbo].[Clientes] ([clienteId]),
                                CONSTRAINT [FK_Proyectos_Objetos] FOREIGN KEY ([objetoId]) REFERENCES [dbo].[Objetos] ([objetoId])
                            )";
                        using (var command = new SqlCommand(proyectosTableSql, connection))
                        {
                            command.ExecuteNonQuery();
                        }
                        Log("Tabla Proyectos creada correctamente.");
                    }

                    // Listar las tablas después de la creación
                    existingTables.Clear();
                    using (var command = new SqlCommand("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'", connection))
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            existingTables.Add(reader.GetString(0).ToLower());
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
                logFilePath = Path.Combine(Directory.GetCurrentDirectory(), $"migration_log_{DateTime.Now:yyyyMMdd_HHmmss}.txt");
                File.WriteAllText(logFilePath, logBuilder.ToString());
                Log($"Log guardado en: {logFilePath}");
            }
        }

        private static string GetCreateTableSql(string tableName)
        {
            switch (tableName)
            {
                case "EstadosProyecto":
                    return @"
                        CREATE TABLE [dbo].[EstadosProyecto] (
                            [estadoProyectoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [estadoProyectoNombre] NVARCHAR(50) NOT NULL,
                            [estadoProyectoDescripcion] NVARCHAR(200) NULL,
                            [estadoProyectoColor] NVARCHAR(7) NULL,
                            [estadoProyectoOrden] INT NOT NULL DEFAULT 0,
                            [estadoProyectoEsFinal] BIT NOT NULL DEFAULT 0,
                            [estadoProyectoActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";
                
                case "EstadosAprobacion":
                    return @"
                        CREATE TABLE [dbo].[EstadosAprobacion] (
                            [estadoAprobacionId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [estadoAprobacionNombre] NVARCHAR(50) NOT NULL,
                            [estadoAprobacionDescripcion] NVARCHAR(200) NULL,
                            [estadoAprobacionColor] NVARCHAR(7) NULL,
                            [estadoAprobacionOrden] INT NOT NULL DEFAULT 0,
                            [estadoAprobacionEsFinal] BIT NOT NULL DEFAULT 0,
                            [estadoAprobacionActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";

                case "EstadosEtapa":
                    return @"
                        CREATE TABLE [dbo].[EstadosEtapa] (
                            [estadoEtapaId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [estadoEtapaNombre] NVARCHAR(50) NOT NULL,
                            [estadoEtapaDescripcion] NVARCHAR(200) NULL,
                            [estadoEtapaColor] NVARCHAR(7) NULL,
                            [estadoEtapaOrden] INT NOT NULL DEFAULT 0,
                            [estadoEtapaEsFinal] BIT NOT NULL DEFAULT 0,
                            [estadoEtapaActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";

                case "EstadosTarea":
                    return @"
                        CREATE TABLE [dbo].[EstadosTarea] (
                            [estadoTareaId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [estadoTareaNombre] NVARCHAR(50) NOT NULL,
                            [estadoTareaDescripcion] NVARCHAR(200) NULL,
                            [estadoTareaColor] NVARCHAR(7) NULL,
                            [estadoTareaOrden] INT NOT NULL DEFAULT 0,
                            [estadoTareaEsFinal] BIT NOT NULL DEFAULT 0,
                            [estadoTareaActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";

                case "PrioridadesTarea":
                    return @"
                        CREATE TABLE [dbo].[PrioridadesTarea] (
                            [prioridadTareaId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [prioridadTareaNombre] NVARCHAR(50) NOT NULL,
                            [prioridadTareaDescripcion] NVARCHAR(200) NULL,
                            [prioridadTareaColor] NVARCHAR(7) NULL,
                            [prioridadTareaNivel] INT NOT NULL DEFAULT 0,
                            [prioridadTareaActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";

                case "TiposProyecto":
                    return @"
                        CREATE TABLE [dbo].[TiposProyecto] (
                            [tipoProyectoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [tipoProyectoNombre] NVARCHAR(50) NOT NULL,
                            [tipoProyectoDescripcion] NVARCHAR(200) NULL,
                            [tipoProyectoActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";

                case "TiposDocumento":
                    return @"
                        CREATE TABLE [dbo].[TiposDocumento] (
                            [tipoDocumentoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [tipoDocumentoNombre] NVARCHAR(50) NOT NULL,
                            [tipoDocumentoDescripcion] NVARCHAR(200) NULL,
                            [tipoDocumentoExtensionesPermitidas] NVARCHAR(200) NULL,
                            [tipoDocumentoTamanoMaximoMB] DECIMAL(10, 2) NULL,
                            [tipoDocumentoActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";

                case "TiposKPI":
                    return @"
                        CREATE TABLE [dbo].[TiposKPI] (
                            [tipoKPIId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [tipoKPINombre] NVARCHAR(50) NOT NULL,
                            [tipoKPIDescripcion] NVARCHAR(200) NULL,
                            [tipoKPIActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";

                case "FrecuenciasMedicion":
                    return @"
                        CREATE TABLE [dbo].[FrecuenciasMedicion] (
                            [frecuenciaMedicionId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [frecuenciaMedicionNombre] NVARCHAR(50) NOT NULL,
                            [frecuenciaMedicionDescripcion] NVARCHAR(200) NULL,
                            [frecuenciaMedicionDias] INT NOT NULL DEFAULT 0,
                            [frecuenciaMedicionActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";

                case "CategoriasGasto":
                    return @"
                        CREATE TABLE [dbo].[CategoriasGasto] (
                            [categoriaGastoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [categoriaGastoNombre] NVARCHAR(50) NOT NULL,
                            [categoriaGastoDescripcion] NVARCHAR(200) NULL,
                            [categoriaGastoActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";
                
                case "Monedas":
                    return @"
                        CREATE TABLE [dbo].[Monedas] (
                            [monedaId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [monedaNombre] NVARCHAR(50) NOT NULL,
                            [monedaCodigo] NVARCHAR(3) NOT NULL,
                            [monedaSimbolo] NVARCHAR(5) NOT NULL,
                            [monedaActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";

                case "TiposMovimientoViatico":
                    return @"
                        CREATE TABLE [dbo].[TiposMovimientoViatico] (
                            [tipoMovimientoViaticoId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                            [tipoMovimientoViaticoNombre] NVARCHAR(50) NOT NULL,
                            [tipoMovimientoViaticoDescripcion] NVARCHAR(200) NULL,
                            [tipoMovimientoViaticoAfectacion] NVARCHAR(10) NOT NULL,
                            [tipoMovimientoViaticoActivo] BIT NOT NULL DEFAULT 1,
                            [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
                            [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
                        )";

                default:
                    return $"-- No se ha definido el script SQL para la tabla {tableName}";
            }
        }
    }
}
