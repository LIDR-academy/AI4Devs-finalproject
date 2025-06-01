using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;
using ConsultCore31.Core.Entities;

namespace PruebasIntegracion
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;
            Console.WriteLine("Iniciando pruebas de integración para verificar la migración de tablas a CamelCase...");
            
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

                    // Obtener todas las entidades con atributo Table
                    Log("\nVerificando entidades con atributo Table:");
                    var entityTypes = GetEntityTypesWithTableAttribute();
                    
                    foreach (var entityType in entityTypes)
                    {
                        var tableAttribute = GetTableAttribute(entityType);
                        if (tableAttribute != null)
                        {
                            string tableName = tableAttribute.Item1;
                            string schema = tableAttribute.Item2;
                            
                            Log($"- Entidad: {entityType.Name}, Tabla: {tableName}, Esquema: {schema}");
                            
                            // Verificar si la tabla existe en la base de datos
                            bool tableExists = CheckTableExists(connection, tableName, schema);
                            if (tableExists)
                            {
                                Log($"  ✓ La tabla {schema}.{tableName} existe en la base de datos.");
                                
                                // Verificar si podemos acceder a los datos
                                int rowCount = GetTableRowCount(connection, tableName, schema);
                                Log($"  ✓ La tabla {schema}.{tableName} contiene {rowCount} registros.");
                            }
                            else
                            {
                                Log($"  ✗ ERROR: La tabla {schema}.{tableName} NO existe en la base de datos.");
                            }
                        }
                    }
                }

                Log("\nPruebas de integración completadas.");
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
                string logFilePath = $"pruebas_integracion_log_{DateTime.Now:yyyyMMdd_HHmmss}.txt";
                File.WriteAllText(logFilePath, logBuilder.ToString());
                Log($"Log guardado en: {logFilePath}");
                
                // Esperar a que el usuario presione una tecla antes de salir
                Console.WriteLine("\nPresiona cualquier tecla para salir...");
                Console.ReadKey();
            }
        }

        // Método para obtener todas las entidades con atributo Table
        private static List<Type> GetEntityTypesWithTableAttribute()
        {
            var result = new List<Type>();
            
            // Obtener el assembly que contiene las entidades
            var assembly = typeof(ObjetoTipo).Assembly;
            
            // Obtener todos los tipos definidos en el assembly
            var types = assembly.GetTypes();
            
            // Filtrar los tipos que tienen el atributo Table
            foreach (var type in types)
            {
                if (type.GetCustomAttributes(typeof(System.ComponentModel.DataAnnotations.Schema.TableAttribute), true).Length > 0)
                {
                    result.Add(type);
                }
            }
            
            return result;
        }

        // Método para obtener el nombre de la tabla y el esquema de una entidad
        private static Tuple<string, string> GetTableAttribute(Type entityType)
        {
            var tableAttribute = entityType.GetCustomAttributes(typeof(System.ComponentModel.DataAnnotations.Schema.TableAttribute), true)
                .FirstOrDefault() as System.ComponentModel.DataAnnotations.Schema.TableAttribute;
            
            if (tableAttribute != null)
            {
                return new Tuple<string, string>(tableAttribute.Name, tableAttribute.Schema ?? "dbo");
            }
            
            return null;
        }

        // Método para verificar si una tabla existe en la base de datos
        private static bool CheckTableExists(SqlConnection connection, string tableName, string schema)
        {
            using (var command = new SqlCommand(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = @TableName AND TABLE_SCHEMA = @Schema", 
                connection))
            {
                command.Parameters.AddWithValue("@TableName", tableName);
                command.Parameters.AddWithValue("@Schema", schema);
                
                int count = (int)command.ExecuteScalar();
                return count > 0;
            }
        }

        // Método para obtener el número de registros en una tabla
        private static int GetTableRowCount(SqlConnection connection, string tableName, string schema)
        {
            using (var command = new SqlCommand($"SELECT COUNT(*) FROM [{schema}].[{tableName}]", connection))
            {
                return (int)command.ExecuteScalar();
            }
        }
    }
}
