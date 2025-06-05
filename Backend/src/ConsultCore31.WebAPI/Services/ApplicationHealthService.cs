using ConsultCore31.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;

namespace ConsultCore31.WebAPI.Services;

/// <summary>
/// Servicio que monitorea la salud de la aplicación y sus dependencias
/// </summary>
public class ApplicationHealthService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ApplicationHealthService> _logger;
    private readonly ConcurrentDictionary<string, HealthStatus> _healthStatuses = new();
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5);

    public ApplicationHealthService(
        IServiceProvider serviceProvider,
        ILogger<ApplicationHealthService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Servicio de monitoreo de salud iniciado");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckDatabaseHealthAsync();
                
                // Aquí se pueden agregar más verificaciones de salud para otros servicios
                
                _logger.LogInformation("Verificación de salud completada. Próxima verificación en {Interval} minutos",
                    _checkInterval.TotalMinutes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante la verificación de salud de la aplicación");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task CheckDatabaseHealthAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        try
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            // Verificar la conexión a la base de datos
            var canConnect = await dbContext.Database.CanConnectAsync();
            
            stopwatch.Stop();
            
            if (canConnect)
            {
                _healthStatuses["Database"] = new HealthStatus
                {
                    Status = "Healthy",
                    LastChecked = DateTime.UtcNow,
                    ResponseTime = stopwatch.ElapsedMilliseconds,
                    Details = "Conexión a la base de datos establecida correctamente"
                };
                
                _logger.LogInformation(
                    "Verificación de salud de la base de datos: Saludable | Tiempo de respuesta: {ResponseTime}ms",
                    stopwatch.ElapsedMilliseconds);
                
                // Verificar estadísticas adicionales de la base de datos
                try
                {
                    // Obtener información sobre las tablas principales
                    var usuariosCount = await dbContext.Set<ConsultCore31.Core.Entities.Usuario>().CountAsync();
                    var perfilesCount = await dbContext.Set<ConsultCore31.Core.Entities.Perfil>().CountAsync();
                    
                    _logger.LogDebug(
                        "Estadísticas de la base de datos: Usuarios: {UsuariosCount}, Perfiles: {PerfilesCount}",
                        usuariosCount,
                        perfilesCount);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "No se pudieron obtener estadísticas detalladas de la base de datos");
                }
            }
            else
            {
                _healthStatuses["Database"] = new HealthStatus
                {
                    Status = "Unhealthy",
                    LastChecked = DateTime.UtcNow,
                    ResponseTime = stopwatch.ElapsedMilliseconds,
                    Details = "No se pudo establecer conexión con la base de datos"
                };
                
                _logger.LogCritical(
                    "Verificación de salud de la base de datos: No saludable | Tiempo de respuesta: {ResponseTime}ms",
                    stopwatch.ElapsedMilliseconds);
            }
        }
        catch (Exception ex)
        {
            _healthStatuses["Database"] = new HealthStatus
            {
                Status = "Unhealthy",
                LastChecked = DateTime.UtcNow,
                ResponseTime = -1,
                Details = $"Error al verificar la salud de la base de datos: {ex.Message}"
            };
            
            _logger.LogCritical(ex, "Error al verificar la salud de la base de datos");
        }
    }

    /// <summary>
    /// Obtiene el estado actual de salud de todos los componentes monitoreados
    /// </summary>
    public IDictionary<string, HealthStatus> GetHealthStatus()
    {
        return _healthStatuses;
    }

    /// <summary>
    /// Clase que representa el estado de salud de un componente
    /// </summary>
    public class HealthStatus
    {
        public string Status { get; set; } = string.Empty;
        public DateTime LastChecked { get; set; }
        public long ResponseTime { get; set; }
        public string Details { get; set; } = string.Empty;
    }
}