using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.EstadoProyecto
{
    /// <summary>
    /// DTO para crear un nuevo estado de proyecto
    /// </summary>
    public class CreateEstadoProyectoDto : CreateBaseDto
    {
        /// <summary>
        /// Nombre del estado del proyecto
        /// </summary>
        [Required(ErrorMessage = "El nombre del estado de proyecto es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del estado del proyecto
        /// </summary>
        [StringLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Color asociado al estado del proyecto (en formato hexadecimal)
        /// </summary>
        [StringLength(7, ErrorMessage = "El color debe estar en formato hexadecimal (ej: #FFFFFF) y no exceder 7 caracteres")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "El color debe estar en formato hexadecimal válido (ej: #FFFFFF)")]
        public string? Color { get; set; }

        /// <summary>
        /// Orden de visualización del estado del proyecto
        /// </summary>
        [Range(0, 100, ErrorMessage = "El orden debe estar entre 0 y 100")]
        public int Orden { get; set; }

        /// <summary>
        /// Indica si el estado del proyecto representa un estado final
        /// </summary>
        public bool EsEstadoFinal { get; set; }

        /// <summary>
        /// Indica si el estado del proyecto está activo
        /// </summary>
        public bool Activo { get; set; } = true;
    }
}