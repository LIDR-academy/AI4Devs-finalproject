using System;

namespace TempMigrator
{
    class ProgramSimple
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Iniciando migración de base de datos...");
            CrearTablas.EjecutarCreacionTablas();
            Console.WriteLine("Proceso de migración completado.");
        }
    }
}
