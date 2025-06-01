using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace ActualizarTablasCamelCase
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Iniciando proceso de actualización de nombres de tablas a CamelCase...");
            
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
                var configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
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
                    using (var command = new SqlCommand("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME", connection))
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            existingTables.Add(reader.GetString(0));
                        }
                    }

                    Log($"Tablas existentes antes de la actualización: {string.Join(", ", existingTables)}");

                    // Mapeo de nombres de tablas (formato_antiguo -> FormatoCamelCase)
                    var tableNameMapping = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                    {
                        // Agregar aquí el mapeo de nombres de tablas si es necesario
                        // Por ejemplo: { "usuarios_token", "UsuarioTokens" }
                    };

                    // Verificar si hay tablas que necesitan ser renombradas
                    var tablesToRename = new List<(string OldName, string NewName)>();
                    foreach (var mapping in tableNameMapping)
                    {
                        if (existingTables.Contains(mapping.Key) && !existingTables.Contains(mapping.Value))
                        {
                            tablesToRename.Add((mapping.Key, mapping.Value));
                        }
                    }

                    if (tablesToRename.Count > 0)
                    {
                        Log("\nTablas que serán renombradas:");
                        foreach (var (oldName, newName) in tablesToRename)
                        {
                            Log($"- {oldName} -> {newName}");
                        }

                        // Renombrar las tablas
                        Log("\nRenombrando tablas...");
                        foreach (var (oldName, newName) in tablesToRename)
                        {
                            Log($"Renombrando tabla {oldName} a {newName}...");
                            using (var command = new SqlCommand($"EXEC sp_rename 'dbo.{oldName}', '{newName}';", connection))
                            {
                                command.ExecuteNonQuery();
                            }
                            Log($"Tabla {oldName} renombrada a {newName} correctamente.");
                        }
                    }
                    else
                    {
                        Log("\nNo se encontraron tablas que necesiten ser renombradas.");
                    }

                    // Listar las tablas después de la actualización
                    existingTables.Clear();
                    using (var command = new SqlCommand("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME", connection))
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            existingTables.Add(reader.GetString(0));
                        }
                    }

                    Log($"\nTablas existentes después de la actualización: {string.Join(", ", existingTables)}");
                }

                Log("\nProceso completado correctamente.");
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
                string logFilePath = $"migration_log_{DateTime.Now:yyyyMMdd_HHmmss}.txt";
                File.WriteAllText(logFilePath, logBuilder.ToString());
                Log($"Log guardado en: {logFilePath}");
            }
        }
    }
}
