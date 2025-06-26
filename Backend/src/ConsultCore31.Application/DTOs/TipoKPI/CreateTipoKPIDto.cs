using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.TipoKPI
{
    /// <summary>
    /// DTO para crear un nuevo tipo de KPI
    /// </summary>
    public class CreateTipoKPIDto : CreateBaseDto
    {
        /// <summary>
        /// Nombre del tipo de KPI
        /// </summary>
        [Required(ErrorMessage = "El nombre del tipo de KPI es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del tipo de KPI
        /// </summary>
        [StringLength(1000, ErrorMessage = "La descripción no puede exceder los 1000 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Unidad de medida del tipo de KPI
        /// </summary>
        [StringLength(200, ErrorMessage = "La unidad de medida no puede exceder los 200 caracteres")]
        public string? Unidad { get; set; }

        /// <summary>
        /// Formato de visualización del tipo de KPI
        /// </summary>
        [StringLength(200, ErrorMessage = "El formato de visualización no puede exceder los 200 caracteres")]
        public string? Formato { get; set; }

        /// <summary>
        /// Indica si el tipo de KPI está activo
        /// </summary>
        public bool Activo { get; set; } = true;
    }
}