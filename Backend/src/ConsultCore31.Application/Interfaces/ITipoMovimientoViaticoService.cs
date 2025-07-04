using ConsultCore31.Application.DTOs.TipoMovimientoViatico;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de tipos de movimiento de viático
    /// </summary>
    public interface ITipoMovimientoViaticoService : IGenericService<TipoMovimientoViaticoDto, CreateTipoMovimientoViaticoDto, UpdateTipoMovimientoViaticoDto, int>
    {
        /// <summary>
        /// Obtiene todos los tipos de movimiento de viático, incluyendo los inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los tipos inactivos</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de tipos de movimiento de viático</returns>
        Task<IEnumerable<TipoMovimientoViaticoDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    }
}