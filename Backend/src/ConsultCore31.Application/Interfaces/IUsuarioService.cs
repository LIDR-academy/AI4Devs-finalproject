using ConsultCore31.Application.DTOs.Usuario;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de Usuario
    /// </summary>
    public interface IUsuarioService
    {
        /// <summary>
        /// Obtiene todos los usuarios
        /// </summary>
        Task<IEnumerable<UsuarioDto>> GetAllUsuariosAsync();

        /// <summary>
        /// Obtiene un usuario por su ID
        /// </summary>
        Task<UsuarioDto> GetUsuarioByIdAsync(int id);

        /// <summary>
        /// Crea un nuevo usuario
        /// </summary>
        Task<UsuarioDto> CreateUsuarioAsync(CreateUsuarioDto createUsuarioDto);

        /// <summary>
        /// Actualiza un usuario existente
        /// </summary>
        Task<bool> UpdateUsuarioAsync(UpdateUsuarioDto updateUsuarioDto);

        /// <summary>
        /// Elimina un usuario por su ID
        /// </summary>
        Task<bool> DeleteUsuarioAsync(int id);

        /// <summary>
        /// Verifica si un correo electrónico ya está en uso
        /// </summary>
        /// <param name="email">Correo electrónico a verificar</param>
        /// <param name="excludeId">ID del usuario a excluir de la verificación (opcional)</param>
        /// <returns>True si el correo ya está en uso, false en caso contrario</returns>
        Task<bool> ExistsByEmailAsync(string email, int? excludeId = null);

        /// <summary>
        /// Verifica si un correo electrónico ya está en uso (versión con ID numérico)
        /// </summary>
        /// <param name="email">Correo electrónico a verificar</param>
        /// <param name="excludeId">ID del usuario a excluir de la verificación (opcional)</param>
        /// <returns>True si el correo ya está en uso, false en caso contrario</returns>
        Task<bool> ExistsByEmailWithIntIdAsync(string email, int? excludeId = null);
    }
}