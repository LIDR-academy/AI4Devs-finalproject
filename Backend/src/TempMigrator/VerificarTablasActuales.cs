using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;

namespace VerificarTablasActuales
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Verificando tablas actuales en la base de datos...");
            
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");
            Console.WriteLine($"Conectando a la base de datos...");

            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                Console.WriteLine("Conexión establecida correctamente.");

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

                Console.WriteLine($"\nTablas existentes en la base de datos ({existingTables.Count}):");
                foreach (var table in existingTables)
                {
                    Console.WriteLine($"- {table}");
                }
            }

            Console.WriteLine("\nVerificación completada.");
        }
    }
}
