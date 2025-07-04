using ConsultCore31.Application.DTOs.TipoKPI;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de tipos de KPI
    /// </summary>
    public interface ITipoKPIService : IGenericService<TipoKPIDto, CreateTipoKPIDto, UpdateTipoKPIDto, int>
    {
        /// <summary>
        /// Obtiene todos los tipos de KPI, incluyendo los inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los tipos inactivos</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de tipos de KPI</returns>
        Task<IEnumerable<TipoKPIDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    }
}