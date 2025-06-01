using ConsultCore31.Application.DTOs.Common;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.EstadoAprobacion
{
    /// <summary>
    /// DTO para crear un nuevo estado de aprobación
    /// </summary>
    public class CreateEstadoAprobacionDto : CreateBaseDto
    {
        /// <summary>
        /// Nombre del estado de aprobación
        /// </summary>
        [Required(ErrorMessage = "El nombre del estado de aprobación es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del estado de aprobación
        /// </summary>
        [StringLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Color asociado al estado de aprobación (en formato hexadecimal)
        /// </summary>
        [StringLength(7, ErrorMessage = "El color debe tener formato hexadecimal (#RRGGBB)")]
        [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "El color debe tener formato hexadecimal válido (#RRGGBB)")]
        public string? Color { get; set; }

        /// <summary>
        /// Indica si el estado de aprobación representa una aprobación
        /// </summary>
        public bool EsAprobado { get; set; }

        /// <summary>
        /// Indica si el estado de aprobación representa un rechazo
        /// </summary>
        public bool EsRechazado { get; set; }

        /// <summary>
        /// Indica si el estado de aprobación está activo
        /// </summary>
        public bool Activo { get; set; } = true;
    }
}
