using ConsultCore31.Application.DTOs.Perfil;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de Perfil
    /// </summary>
    public interface IPerfilService : IGenericService<PerfilDto, CreatePerfilDto, UpdatePerfilDto, int>
    {
        /// <summary>
        /// Obtiene todos los perfiles, con opción de incluir inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los perfiles inactivos</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de perfiles</returns>
        Task<IEnumerable<PerfilDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Obtiene un perfil por su ID con información detallada
        /// </summary>
        /// <param name="id">ID del perfil</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>DTO del perfil</returns>
        Task<PerfilDto> GetPerfilByIdAsync(int id, CancellationToken cancellationToken = default);
    }
}