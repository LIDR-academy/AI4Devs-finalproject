using ConsultCore31.Application.DTOs.Proyecto;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de proyectos
    /// </summary>
    public interface IProyectoService : IGenericService<ProyectoDto, CreateProyectoDto, UpdateProyectoDto, int>
    {
        /// <summary>
        /// Obtiene todos los proyectos, incluyendo los inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los tipos inactivos</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de proyectos</returns>
        Task<IEnumerable<ProyectoDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    }
}