using ConsultCore31.Infrastructure.Persistence.Context;
using ConsultCore31.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Text;

namespace ConsultCore31.WebAPI.Controllers;

/// <summary>
/// Controlador para diagnóstico y monitoreo de la aplicación
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class DiagnosticController : ControllerBase
{
    private readonly ILogger<DiagnosticController> _logger;
    private readonly AppDbContext _dbContext;
    private readonly IWebHostEnvironment _environment;
    private readonly ApplicationHealthService _healthService;

    public DiagnosticController(
        ILogger<DiagnosticController> logger,
        AppDbContext dbContext,
        IWebHostEnvironment environment,
        ApplicationHealthService healthService)
    {
        _logger = logger;
        _dbContext = dbContext;
        _environment = environment;
        _healthService = healthService;
    }

    /// <summary>
    /// Endpoint para verificar el estado de salud de la aplicación
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    public IActionResult GetHealthCheck()
    {
        try
        {
            var healthStatuses = _healthService.GetHealthStatus();
            
            // Verificar si algún componente está en estado no saludable
            var isHealthy = !healthStatuses.Any() || healthStatuses.All(s => s.Value.Status == "Healthy");
            
            return Ok(new
            {
                status = isHealthy ? "Healthy" : "Unhealthy",
                environment = _environment.EnvironmentName,
                timestamp = DateTime.UtcNow,
                components = healthStatuses
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener el estado de salud");
            return StatusCode(500, new { status = "Error", message = "Error al verificar el estado de salud" });
        }
    }

    /// <summary>
    /// Endpoint para verificar la conexión a la base de datos
    /// </summary>
    [HttpGet("database")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> CheckDatabaseConnection()
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            // Verificar la conexión a la base de datos
            var canConnect = await _dbContext.Database.CanConnectAsync();
            stopwatch.Stop();
            
            if (!canConnect)
            {
                _logger.LogCritical("No se puede conectar a la base de datos. Tiempo: {ElapsedMs}ms", 
                    stopwatch.ElapsedMilliseconds);
                
                return StatusCode(503, new
                {
                    status = "Error",
                    message = "No se puede conectar a la base de datos",
                    elapsedMs = stopwatch.ElapsedMilliseconds
                });
            }
            
            // Obtener información sobre la base de datos
            var connection = _dbContext.Database.GetDbConnection();
            var pendingMigrations = await _dbContext.Database.GetPendingMigrationsAsync();
            var appliedMigrations = await _dbContext.Database.GetAppliedMigrationsAsync();
            
            _logger.LogInformation(
                "Conexión a la base de datos exitosa. Tiempo: {ElapsedMs}ms", 
                stopwatch.ElapsedMilliseconds);
            
            return Ok(new
            {
                status = "Connected",
                databaseProvider = connection.GetType().Name,
                dataSource = connection.DataSource,
                database = connection.Database,
                pendingMigrations = pendingMigrations.ToList(),
                appliedMigrations = appliedMigrations.ToList(),
                elapsedMs = stopwatch.ElapsedMilliseconds
            });
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            
            _logger.LogCritical(ex, "Error al verificar la conexión a la base de datos");
            
            return StatusCode(500, new
            {
                status = "Error",
                message = "Error al verificar la conexión a la base de datos",
                error = ex.Message,
                elapsedMs = stopwatch.ElapsedMilliseconds
            });
        }
    }

    /// <summary>
    /// Endpoint para obtener información del sistema
    /// </summary>
    [HttpGet("system")]
    [Authorize(Roles = "Administrador")]
    public IActionResult GetSystemInfo()
    {
        try
        {
            var systemInfo = new
            {
                environment = _environment.EnvironmentName,
                applicationName = _environment.ApplicationName,
                contentRootPath = _environment.ContentRootPath,
                webRootPath = _environment.WebRootPath,
                frameworkDescription = System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription,
                osDescription = System.Runtime.InteropServices.RuntimeInformation.OSDescription,
                processArchitecture = System.Runtime.InteropServices.RuntimeInformation.ProcessArchitecture.ToString(),
                osArchitecture = System.Runtime.InteropServices.RuntimeInformation.OSArchitecture.ToString(),
                memoryUsage = GC.GetTotalMemory(false) / (1024 * 1024) + " MB",
                processorCount = Environment.ProcessorCount,
                serverTime = DateTime.Now,
                serverTimeUtc = DateTime.UtcNow,
                serverTimeZone = TimeZoneInfo.Local.DisplayName
            };
            
            return Ok(systemInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener información del sistema");
            return StatusCode(500, new { status = "Error", message = "Error al obtener información del sistema" });
        }
    }

    /// <summary>
    /// Endpoint para obtener información detallada de diagnóstico (solo para administradores)
    /// </summary>
    [HttpGet("detailed")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> GetDetailedDiagnostics()
    {
        try
        {
            var sb = new StringBuilder();
            
            // Información del sistema
            sb.AppendLine("=== INFORMACIÓN DEL SISTEMA ===");
            sb.AppendLine($"Entorno: {_environment.EnvironmentName}");
            sb.AppendLine($"Framework: {System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription}");
            sb.AppendLine($"Sistema operativo: {System.Runtime.InteropServices.RuntimeInformation.OSDescription}");
            sb.AppendLine($"Uso de memoria: {GC.GetTotalMemory(false) / (1024 * 1024)} MB");
            sb.AppendLine();
            
            // Información de la base de datos
            sb.AppendLine("=== INFORMACIÓN DE LA BASE DE DATOS ===");
            try
            {
                var canConnect = await _dbContext.Database.CanConnectAsync();
                sb.AppendLine($"Conexión: {(canConnect ? "Exitosa" : "Fallida")}");
                
                if (canConnect)
                {
                    var connection = _dbContext.Database.GetDbConnection();
                    sb.AppendLine($"Proveedor: {connection.GetType().Name}");
                    sb.AppendLine($"Servidor: {connection.DataSource}");
                    sb.AppendLine($"Base de datos: {connection.Database}");
                    
                    var pendingMigrations = await _dbContext.Database.GetPendingMigrationsAsync();
                    sb.AppendLine($"Migraciones pendientes: {pendingMigrations.Count()}");
                    if (pendingMigrations.Any())
                    {
                        sb.AppendLine("  " + string.Join("\n  ", pendingMigrations));
                    }
                }
            }
            catch (Exception ex)
            {
                sb.AppendLine($"Error al obtener información de la base de datos: {ex.Message}");
            }
            sb.AppendLine();
            
            // Estadísticas de la aplicación
            sb.AppendLine("=== ESTADÍSTICAS DE LA APLICACIÓN ===");
            try
            {
                var usuariosCount = await _dbContext.Set<ConsultCore31.Core.Entities.Usuario>().CountAsync();
                var perfilesCount = await _dbContext.Set<ConsultCore31.Core.Entities.Perfil>().CountAsync();
                var objetosCount = await _dbContext.Set<ConsultCore31.Core.Entities.Objeto>().CountAsync();
                
                sb.AppendLine($"Usuarios: {usuariosCount}");
                sb.AppendLine($"Perfiles: {perfilesCount}");
                sb.AppendLine($"Objetos: {objetosCount}");
            }
            catch (Exception ex)
            {
                sb.AppendLine($"Error al obtener estadísticas: {ex.Message}");
            }
            
            return Ok(new
            {
                timestamp = DateTime.UtcNow,
                report = sb.ToString()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al generar diagnóstico detallado");
            return StatusCode(500, new { status = "Error", message = "Error al generar diagnóstico detallado" });
        }
    }
}