using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.EstadoAprobacion
{
    /// <summary>
    /// DTO para representar un estado de aprobación en respuestas de la API
    /// </summary>
    public class EstadoAprobacionDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del estado de aprobación
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del estado de aprobación
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Color asociado al estado de aprobación (en formato hexadecimal)
        /// </summary>
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
        public bool Activo { get; set; }
    }
}