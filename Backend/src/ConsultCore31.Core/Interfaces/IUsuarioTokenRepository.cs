using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz para el repositorio de UsuarioToken
    /// </summary>
    public interface IUsuarioTokenRepository : IRepository<UsuarioToken>
    {
        /// <summary>
        /// Obtiene un token por su valor
        /// </summary>
        Task<UsuarioToken> GetByTokenAsync(Guid token);

        /// <summary>
        /// Obtiene todos los tokens activos de un usuario
        /// </summary>
        /// <param name="usuarioId">Identificador único del usuario</param>
        Task<IEnumerable<UsuarioToken>> GetActiveTokensByUsuarioIdAsync(int usuarioId);

        /// <summary>
        /// Invalida todos los tokens de un usuario (marca como usados)
        /// </summary>
        /// <param name="usuarioId">Identificador único del usuario</param>
        /// <param name="ipAddress">Dirección IP desde donde se realiza la invalidación</param>
        /// <param name="motivo">Motivo de la invalidación (opcional)</param>
        Task InvalidateUserTokensAsync(int usuarioId, string ipAddress, string? motivo = null);

        /// <summary>
        /// Marca un token como utilizado
        /// </summary>
        /// <param name="token">Token a marcar como utilizado</param>
        /// <param name="ipAddress">Dirección IP desde donde se realiza la operación</param>
        /// <param name="motivo">Motivo de la operación (opcional)</param>
        Task MarkAsUsedAsync(Guid token, string ipAddress, string? motivo = null);

        /// <summary>
        /// Verifica si un token es válido (existe, no ha sido usado y no ha expirado)
        /// </summary>
        Task<bool> IsValidTokenAsync(Guid token);

        /// <summary>
        /// Elimina todos los tokens expirados de la base de datos
        /// </summary>
        /// <returns>Número de tokens eliminados</returns>
        Task<int> RemoveExpiredTokensAsync();
    }
}