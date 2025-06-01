using System;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.UsuarioToken
{
    /// <summary>
    /// DTO para la entidad UsuarioToken
    /// </summary>
    public class UsuarioTokenDto
    {
        /// <summary>
        /// Identificador único del token
        /// </summary>
        public int Id { get; set; }


        /// <summary>
        /// Identificador del usuario
        /// </summary>
        public int UsuarioId { get; set; }


        /// <summary>
        /// Identificador único del JWT
        /// </summary>
        public Guid JwtId { get; set; }


        /// <summary>
        /// Token de usuario
        /// </summary>
        public Guid Token { get; set; }


        /// <summary>
        /// Indica si el token ha sido utilizado
        /// </summary>
        public bool Usado { get; set; }


        /// <summary>
        /// Fecha de creación del token
        /// </summary>
        public DateTime FechaCreacion { get; set; }


        /// <summary>
        /// Fecha de expiración del token
        /// </summary>
        public DateTime FechaExpiracion { get; set; }


        /// <summary>
        /// Indica si el token ha expirado
        /// </summary>
        public bool EstaExpirado => DateTime.UtcNow >= FechaExpiracion;

        /// <summary>
        /// Indica si el token está activo (no ha sido usado y no ha expirado)
        /// </summary>
        public bool EstaActivo => !Usado && !EstaExpirado;
    }

    /// <summary>
    /// DTO para la creación de un token de usuario
    /// </summary>
    public class CreateUsuarioTokenDto
    {
        /// <summary>
        /// Identificador del usuario
        /// </summary>
        [Required(ErrorMessage = "El ID de usuario es requerido")]
        public int UsuarioId { get; set; }

        /// <summary>
        /// Identificador único del JWT
        /// </summary>
        [Required(ErrorMessage = "El ID del JWT es requerido")]
        public Guid JwtId { get; set; }

        /// <summary>
        /// Token de usuario
        /// </summary>
        [Required(ErrorMessage = "El token es requerido")]
        public Guid Token { get; set; }


        /// <summary>
        /// Fecha de expiración del token
        /// </summary>
        [Required(ErrorMessage = "La fecha de expiración es requerida")]
        public DateTime FechaExpiracion { get; set; }
    }

    /// <summary>
    /// DTO para la validación de un token
    /// </summary>
    public class ValidateTokenDto
    {
        /// <summary>
        /// Token a validar
        /// </summary>
        [Required(ErrorMessage = "El token es requerido")]
        public Guid Token { get; set; }
    }

    /// <summary>
    /// DTO para la respuesta de validación de token
    /// </summary>
    public class TokenValidationResultDto
    {
        /// <summary>
        /// Indica si el token es válido
        /// </summary>
        public bool IsValid { get; set; }

        /// <summary>
        /// Mensaje descriptivo del resultado de la validación
        /// </summary>
        public string Message { get; set; }
        /// <summary>
        /// Datos del token si la validación es exitosa
        /// </summary>
        public UsuarioTokenDto Token { get; set; }
    }
}
