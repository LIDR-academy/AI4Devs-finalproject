using ConsultCore31.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz para el repositorio de Usuario
    /// </summary>
    public interface IUsuarioRepository : IRepository<Usuario>
    {
        /// <summary>
        /// Obtiene un usuario por su correo electrónico
        /// </summary>
        Task<Usuario> GetByEmailAsync(string email);

        /// <summary>
        /// Obtiene un usuario por su ID incluyendo su perfil
        /// </summary>
        /// <param name="id">ID del usuario como string</param>
        /// <returns>El usuario con su perfil o null si no se encuentra</returns>
        Task<Usuario> GetUsuarioConPerfilAsync(string id);

        /// <summary>
        /// Verifica si un usuario con el correo electrónico dado ya existe
        /// </summary>
        /// <param name="email">Correo electrónico a verificar</param>
        /// <param name="excludeId">ID del usuario a excluir de la búsqueda (opcional)</param>
        /// <param name="cancellationToken">Token de cancelación (opcional)</param>
        /// <returns>True si existe un usuario con el correo electrónico, false en caso contrario</returns>
        Task<bool> ExistsByEmailAsync(string email, string excludeId = null, CancellationToken cancellationToken = default);
    }
}
