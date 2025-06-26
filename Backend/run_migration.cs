using System;
using System.IO;
using Microsoft.Data.SqlClient;

class Program
{
    static void Main()
    {
        string connectionString = "Server=rrdeveloper.sytes.net,9701;Initial Catalog=ConsultCore31;User ID=sa;Password=vecrec01;Connect Timeout=600;MultipleActiveResultSets=true;Encrypt=true;TrustServerCertificate=true;Connection Lifetime=60;Max Pool Size=100;Application Name=ConsultCore;Pooling=true;";
        string sqlScript = File.ReadAllText("src/ConsultCore31.Infrastructure/Migrations/20250625_RefactorTipoKPIToTipoMedida.sql");
        
        try
        {
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                Console.WriteLine("Conectado a la base de datos.");
                
                using (var command = new SqlCommand(sqlScript, connection))
                {
                    command.CommandTimeout = 300; // 5 minutos
                    command.ExecuteNonQuery();
                    Console.WriteLine("Migración ejecutada exitosamente.");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}