// En Application/Interfaces/IAccesoService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.Acceso;

namespace ConsultCore31.Application.Interfaces
{
    public interface IAccesoService
    {
        Task<IEnumerable<AccesoDto>> GetAllAccesosAsync();
        Task<AccesoDto?> GetAccesoByIdsAsync(int perfilId, int objetoId);
        Task<AccesoDto> CreateOrUpdateAccesoAsync(AccesoDto dto);
        Task<bool> DeleteAccesoAsync(int perfilId, int objetoId);
        Task<bool> TieneAccesoAsync(int perfilId, int objetoId);
        
        /// <summary>
        /// Verifica si un perfil tiene acceso a un objeto específico
        /// </summary>
        /// <param name="perfilId">ID del perfil</param>
        /// <param name="objetoId">ID del objeto</param>
        /// <returns>DTO con el resultado de la verificación</returns>
        Task<VerificarAccesoDto> VerificarAccesoAsync(int perfilId, int objetoId);
        
        /// <summary>
        /// Obtiene todos los accesos activos para un perfil específico
        /// </summary>
        /// <param name="perfilId">ID del perfil</param>
        /// <returns>Lista de accesos activos para el perfil</returns>
        Task<IEnumerable<AccesoDto>> GetAccesosActivosByPerfilIdAsync(int perfilId);

        /// <summary>
        /// Actualiza el estado de un acceso
        /// </summary>
        /// <param name="perfilId">ID del perfil</param>
        /// <param name="objetoId">ID del objeto</param>
        /// <param name="activo">Nuevo estado del acceso</param>
        /// <returns>True si la actualización fue exitosa, false en caso contrario</returns>
        Task<bool> UpdateAccesoStatusAsync(int perfilId, int objetoId, bool activo);
    }
}