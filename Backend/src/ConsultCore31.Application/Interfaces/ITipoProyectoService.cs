using ConsultCore31.Application.DTOs.TipoProyecto;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de tipos de proyecto
    /// </summary>
    public interface ITipoProyectoService : IGenericService<TipoProyectoDto, CreateTipoProyectoDto, UpdateTipoProyectoDto, int>
    {
        /// <summary>
        /// Obtiene todos los tipos de proyecto, incluyendo los inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los tipos inactivos</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de tipos de proyecto</returns>
        Task<IEnumerable<TipoProyectoDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    }
}