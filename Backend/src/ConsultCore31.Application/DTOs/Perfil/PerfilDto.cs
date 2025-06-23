using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Perfil
{
    /// <summary>
    /// DTO para la entidad Perfil
    /// </summary>
    public class PerfilDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del perfil es requerido")]
        [StringLength(100, ErrorMessage = "El nombre del perfil no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string Descripcion { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;
    }

    /// <summary>
    /// DTO para la creación de un perfil
    /// </summary>
    public class CreatePerfilDto
    {
        [Required(ErrorMessage = "El nombre del perfil es requerido")]
        [StringLength(100, ErrorMessage = "El nombre del perfil no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string Descripcion { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO para la actualización de un perfil
    /// </summary>
    public class UpdatePerfilDto
    {
        [Required(ErrorMessage = "El ID es requerido")]
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre del perfil es requerido")]
        [StringLength(100, ErrorMessage = "El nombre del perfil no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string Descripcion { get; set; } = string.Empty;

        public bool Activo { get; set; } = true;
    }
}