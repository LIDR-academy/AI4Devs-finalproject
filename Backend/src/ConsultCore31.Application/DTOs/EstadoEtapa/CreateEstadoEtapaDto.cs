using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.EstadoEtapa
{
    /// <summary>
    /// DTO para crear un nuevo estado de etapa
    /// </summary>
    public class CreateEstadoEtapaDto : CreateBaseDto
    {
        /// <summary>
        /// Nombre del estado de la etapa
        /// </summary>
        [Required(ErrorMessage = "El nombre del estado de etapa es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del estado de la etapa
        /// </summary>
        [StringLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Color asociado al estado de la etapa (en formato hexadecimal)
        /// </summary>
        [StringLength(7, ErrorMessage = "El color debe estar en formato hexadecimal (ej: #FFFFFF) y no exceder 7 caracteres")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "El color debe estar en formato hexadecimal válido (ej: #FFFFFF)")]
        public string? Color { get; set; }

        /// <summary>
        /// Orden de visualización del estado de la etapa
        /// </summary>
        [Range(0, 100, ErrorMessage = "El orden debe estar entre 0 y 100")]
        public int Orden { get; set; }

        /// <summary>
        /// Indica si el estado de la etapa representa un estado final
        /// </summary>
        public bool EsEstadoFinal { get; set; }

        /// <summary>
        /// Indica si el estado de la etapa está activo
        /// </summary>
        public bool Activo { get; set; } = true;
    }
}