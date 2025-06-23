using ConsultCore31.Application.DTOs.UsuarioToken;

namespace ConsultCore31.Application.Interfaces
{
    /// <summary>
    /// Interfaz para el servicio de gestión de tokens de usuario
    /// </summary>
    public interface IUsuarioTokenService
    {
        /// <summary>
        /// Obtiene un token por su valor
        /// </summary>
        /// <param name="token">Valor del token a buscar</param>
        /// <returns>El token encontrado o null si no existe</returns>
        Task<UsuarioTokenDto> GetTokenAsync(Guid token);

        /// <summary>
        /// Crea un nuevo token de usuario
        /// </summary>
        /// <param name="createDto">Datos para crear el token</param>
        /// <returns>El token creado</returns>
        Task<UsuarioTokenDto> CreateTokenAsync(CreateUsuarioTokenDto createDto);

        /// <summary>
        /// Valida un token
        /// </summary>
        /// <param name="token">Token a validar</param>
        /// <returns>Resultado de la validación</returns>
        Task<TokenValidationResultDto> ValidateTokenAsync(Guid token);

        /// <summary>
        /// Invalida todos los tokens de un usuario (marca como usados)
        /// </summary>
        /// <param name="usuarioId">Identificador único del usuario</param>
        /// <param name="ipAddress">Dirección IP desde donde se realiza la invalidación</param>
        /// <param name="motivo">Motivo de la invalidación (opcional)</param>
        /// <exception cref="ArgumentException">Se lanza cuando el usuarioId es nulo o vacío</exception>
        Task InvalidateUserTokensAsync(int usuarioId, string ipAddress, string? motivo = null);

        /// <summary>
        /// Marca un token como utilizado
        /// </summary>
        /// <param name="token">Token a marcar como utilizado</param>
        /// <param name="ipAddress">Dirección IP desde donde se marca como utilizado</param>
        /// <param name="motivo">Motivo por el cual se marca como utilizado (opcional)</param>
        Task MarkAsUsedAsync(Guid token, string ipAddress, string? motivo = null);

        /// <summary>
        /// Elimina todos los tokens expirados de la base de datos
        /// </summary>
        /// <returns>Número de tokens eliminados</returns>
        Task<int> RemoveExpiredTokensAsync();
    }
}