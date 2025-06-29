using ConsultCore31.Application.DTOs.Puesto;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de puestos
    /// </summary>
    public interface IPuestoService : IGenericService<PuestoDto, CreatePuestoDto, UpdatePuestoDto, int>
    {
        /// <summary>
        /// Obtiene todos los puestos, incluyendo los inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los tipos inactivos</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de puestos</returns>
        Task<IEnumerable<PuestoDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
    }
}