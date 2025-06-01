using System;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Usuario
{
    /// <summary>
    /// DTO para la entidad Usuario
    /// </summary>
    public class UsuarioDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(200, ErrorMessage = "El nombre no puede exceder los 200 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los apellidos son requeridos")]
        [StringLength(300, ErrorMessage = "Los apellidos no pueden exceder los 300 caracteres")]
        public string Apellidos { get; set; } = string.Empty;

        [Required(ErrorMessage = "El correo electrónico es requerido")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido")]
        [StringLength(150, ErrorMessage = "El correo electrónico no puede exceder los 150 caracteres")]
        public string Email { get; set; } = string.Empty;

        [StringLength(15, ErrorMessage = "El número móvil no puede exceder los 15 caracteres")]
        public string Movil { get; set; } = string.Empty;

        [Required(ErrorMessage = "El ID de perfil es requerido")]
        public int PerfilId { get; set; }

        public int? EmpleadoId { get; set; }

        [Required(ErrorMessage = "El ID de objeto es requerido")]
        public int ObjetoId { get; set; }


        public bool Activo { get; set; } = true;
    }

    /// <summary>
    /// DTO para la creación de un usuario
    /// </summary>
    public class CreateUsuarioDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(200, ErrorMessage = "El nombre no puede exceder los 200 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los apellidos son requeridos")]
        [StringLength(300, ErrorMessage = "Los apellidos no pueden exceder los 300 caracteres")]
        public string Apellidos { get; set; } = string.Empty;

        [Required(ErrorMessage = "El correo electrónico es requerido")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido")]
        [StringLength(150, ErrorMessage = "El correo electrónico no puede exceder los 150 caracteres")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es requerida")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "La contraseña debe tener entre 6 y 100 caracteres")]
        public string Password { get; set; } = string.Empty;

        [StringLength(15, ErrorMessage = "El número móvil no puede exceder los 15 caracteres")]
        public string Movil { get; set; } = string.Empty;

        [Required(ErrorMessage = "El ID de perfil es requerido")]
        public int PerfilId { get; set; }

        public int? EmpleadoId { get; set; }
        
        [Required(ErrorMessage = "El ID de objeto es requerido")]
        public int ObjetoId { get; set; } = 2; // Valor por defecto
    }

    /// <summary>
    /// DTO para la actualización de un usuario
    /// </summary>
    public class UpdateUsuarioDto
    {
        [Required(ErrorMessage = "El ID es requerido")]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(200, ErrorMessage = "El nombre no puede exceder los 200 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los apellidos son requeridos")]
        [StringLength(300, ErrorMessage = "Los apellidos no pueden exceder los 300 caracteres")]
        public string Apellidos { get; set; } = string.Empty;

        [Required(ErrorMessage = "El correo electrónico es requerido")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido")]
        [StringLength(150, ErrorMessage = "El correo electrónico no puede exceder los 150 caracteres")]
        public string Email { get; set; } = string.Empty;

        [StringLength(15, ErrorMessage = "El número móvil no puede exceder los 15 caracteres")]
        public string Movil { get; set; } = string.Empty;

        [Required(ErrorMessage = "El ID de perfil es requerido")]
        public int PerfilId { get; set; }

        public int? EmpleadoId { get; set; }
        
        [Required(ErrorMessage = "El ID de objeto es requerido")]
        public int ObjetoId { get; set; }
        
        public bool Activo { get; set; } = true;
    }
}
