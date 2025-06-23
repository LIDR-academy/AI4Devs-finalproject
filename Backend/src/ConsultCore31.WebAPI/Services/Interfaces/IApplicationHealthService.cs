namespace ConsultCore31.WebAPI.Services.Interfaces;

/// <summary>
/// Interfaz para el servicio que monitorea la salud de la aplicación y sus dependencias
/// </summary>
public interface IApplicationHealthService
{
    /// <summary>
    /// Obtiene el estado actual de salud de todos los componentes monitoreados
    /// </summary>
    IDictionary<string, ApplicationHealthService.HealthStatus> GetHealthStatus();
}