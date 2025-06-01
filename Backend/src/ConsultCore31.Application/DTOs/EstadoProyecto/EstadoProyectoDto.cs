using ConsultCore31.Application.DTOs.Common;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.EstadoProyecto
{
    /// <summary>
    /// DTO para representar un estado de proyecto en respuestas de la API
    /// </summary>
    public class EstadoProyectoDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del estado del proyecto
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del estado del proyecto
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Color asociado al estado del proyecto (en formato hexadecimal)
        /// </summary>
        public string? Color { get; set; }

        /// <summary>
        /// Orden de visualización del estado del proyecto
        /// </summary>
        public int Orden { get; set; }

        /// <summary>
        /// Indica si el estado del proyecto representa un estado final
        /// </summary>
        public bool EsEstadoFinal { get; set; }

        /// <summary>
        /// Indica si el estado del proyecto está activo
        /// </summary>
        public bool Activo { get; set; }
    }
}
