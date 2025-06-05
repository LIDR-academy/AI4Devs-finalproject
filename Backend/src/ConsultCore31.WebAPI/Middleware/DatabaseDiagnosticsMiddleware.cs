using ConsultCore31.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace ConsultCore31.WebAPI.Middleware;

/// <summary>
/// Middleware para diagnosticar problemas de conexión a la base de datos
/// </summary>
public class DatabaseDiagnosticsMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<DatabaseDiagnosticsMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public DatabaseDiagnosticsMiddleware(
        RequestDelegate next,
        ILogger<DatabaseDiagnosticsMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
    {
        // Solo ejecutar diagnóstico en la primera solicitud o periódicamente
        if (context.Request.Path.StartsWithSegments("/api") || 
            context.Request.Path.StartsWithSegments("/health"))
        {
            try
            {
                var stopwatch = Stopwatch.StartNew();
                
                // Verificar la conexión a la base de datos
                var canConnect = await dbContext.Database.CanConnectAsync();
                
                stopwatch.Stop();
                
                if (!canConnect)
                {
                    _logger.LogCritical(
                        "No se puede conectar a la base de datos. Tiempo transcurrido: {ElapsedMs}ms",
                        stopwatch.ElapsedMilliseconds);
                    
                    // Registrar información adicional sobre la conexión
                    _logger.LogError("Cadena de conexión: {ConnectionString}", 
                        MaskConnectionString(dbContext.Database.GetConnectionString()));
                    
                    // Si estamos en desarrollo, permitir que continúe pero con un error en el log
                    if (!_environment.IsDevelopment())
                    {
                        context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                        await context.Response.WriteAsJsonAsync(new 
                        { 
                            error = "Error de conexión a la base de datos", 
                            timestamp = DateTime.UtcNow 
                        });
                        return;
                    }
                }
                else
                {
                    _logger.LogInformation(
                        "Conexión a la base de datos exitosa. Tiempo: {ElapsedMs}ms",
                        stopwatch.ElapsedMilliseconds);
                    
                    // Registrar información sobre el proveedor y versión
                    try
                    {
                        var connection = dbContext.Database.GetDbConnection();
                        _logger.LogDebug("Proveedor de base de datos: {Provider}, Servidor: {DataSource}",
                            connection.GetType().Name,
                            connection.DataSource);
                        
                        // Verificar si hay migraciones pendientes
                        var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
                        var pendingCount = pendingMigrations.Count();
                        
                        if (pendingCount > 0)
                        {
                            _logger.LogWarning("Hay {Count} migraciones pendientes: {Migrations}",
                                pendingCount,
                                string.Join(", ", pendingMigrations));
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "No se pudo obtener información detallada de la base de datos");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex, "Error al verificar la conexión a la base de datos");
                
                if (!_environment.IsDevelopment())
                {
                    context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                    await context.Response.WriteAsJsonAsync(new 
                    { 
                        error = "Error de conexión a la base de datos", 
                        timestamp = DateTime.UtcNow 
                    });
                    return;
                }
            }
        }

        await _next(context);
    }

    // Método para enmascarar información sensible de la cadena de conexión
    private string MaskConnectionString(string? connectionString)
    {
        if (string.IsNullOrEmpty(connectionString))
            return "[Cadena de conexión vacía]";

        try
        {
            // Enmascarar contraseña
            var masked = System.Text.RegularExpressions.Regex.Replace(
                connectionString,
                @"(Password|PWD)=([^;]*)",
                "$1=********",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);

            // Enmascarar User ID si es necesario
            masked = System.Text.RegularExpressions.Regex.Replace(
                masked,
                @"(User ID|UID)=([^;]*)",
                "$1=$2", // Mantener el ID de usuario visible
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);

            return masked;
        }
        catch
        {
            return "[Error al enmascarar cadena de conexión]";
        }
    }
}

// Extensión para agregar el middleware a la aplicación
public static class DatabaseDiagnosticsMiddlewareExtensions
{
    public static IApplicationBuilder UseDatabaseDiagnostics(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<DatabaseDiagnosticsMiddleware>();
    }
}