using System.Collections.Generic;

namespace ConsultCore31.WebAPI.DTOs.Auth
{
    /// <summary>
    /// DTO para representar los datos de un usuario
    /// </summary>
    public class UserDto
    {
        /// <summary>
        /// Identificador único del usuario
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Nombre completo del usuario
        /// </summary>
        public string FullName { get; set; }

        /// <summary>
        /// Correo electrónico del usuario
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Roles asignados al usuario
        /// </summary>
        public List<string> Roles { get; set; } = new List<string>();

        /// <summary>
        /// Permisos asignados al usuario
        /// </summary>
        public List<string> Permissions { get; set; } = new List<string>();
    }
}
