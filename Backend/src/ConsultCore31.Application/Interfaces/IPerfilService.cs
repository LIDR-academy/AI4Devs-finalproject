using ConsultCore31.Application.DTOs.Perfil;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de Perfil
    /// </summary>
    public interface IPerfilService
    {
        /// <summary>
        /// Obtiene todos los perfiles
        /// </summary>
        Task<IEnumerable<PerfilDto>> GetAllPerfilesAsync();

        /// <summary>
        /// Obtiene un perfil por su ID
        /// </summary>
        Task<PerfilDto> GetPerfilByIdAsync(int id);

        /// <summary>
        /// Crea un nuevo perfil
        /// </summary>
        Task<PerfilDto> CreatePerfilAsync(CreatePerfilDto createPerfilDto);

        /// <summary>
        /// Actualiza un perfil existente
        /// </summary>
        Task<bool> UpdatePerfilAsync(UpdatePerfilDto updatePerfilDto);

        /// <summary>
        /// Elimina un perfil por su ID
        /// </summary>
        Task<bool> DeletePerfilAsync(int id);
    }
}