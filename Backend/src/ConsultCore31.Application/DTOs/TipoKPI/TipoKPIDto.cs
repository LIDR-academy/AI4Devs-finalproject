using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.TipoKPI
{
    /// <summary>
    /// DTO para representar un tipo de KPI en respuestas de la API
    /// </summary>
    public class TipoKPIDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del tipo de KPI
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del tipo de KPI
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Unidad de medida para este tipo de KPI
        /// </summary>
        public string? Unidad { get; set; }

        /// <summary>
        /// Formato de visualización para los valores de este tipo de KPI
        /// </summary>
        public string? Formato { get; set; }

        /// <summary>
        /// Indica si el tipo de KPI está activo
        /// </summary>
        public bool Activo { get; set; }
    }
}