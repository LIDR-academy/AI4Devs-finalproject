using ConsultCore31.Application.DTOs.Moneda;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de monedas
    /// </summary>
    public interface IMonedaService : IGenericService<MonedaDto, CreateMonedaDto, UpdateMonedaDto, int>
    {
        /// <summary>
        /// Obtiene todos las monedas, incluyendo las inactivas
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también las monedas inactivas</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de monedas</returns>
        Task<IEnumerable<MonedaDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    }
}