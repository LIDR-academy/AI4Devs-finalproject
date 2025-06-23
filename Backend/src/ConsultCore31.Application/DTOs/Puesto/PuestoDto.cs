using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Puesto
{
    /// <summary>
    /// DTO para representar un puesto en respuestas de la API
    /// </summary>
    public class PuestoDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del puesto
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del puesto
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Indica si el puesto está activo
        /// </summary>
        public bool Activo { get; set; }
    }
}