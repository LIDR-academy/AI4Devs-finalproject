using ConsultCore31.Application.DTOs.Common;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.TipoProyecto
{
    /// <summary>
    /// DTO para representar un tipo de proyecto en respuestas de la API
    /// </summary>
    public class TipoProyectoDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del tipo de proyecto
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del tipo de proyecto
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Indica si el tipo de proyecto está activo
        /// </summary>
        public bool Activo { get; set; }
    }
}
