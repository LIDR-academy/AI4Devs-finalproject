using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.EstadoTarea
{
    /// <summary>
    /// DTO para representar un estado de tarea en respuestas de la API
    /// </summary>
    public class EstadoTareaDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del estado de la tarea
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del estado de la tarea
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Color asociado al estado de la tarea (en formato hexadecimal)
        /// </summary>
        public string? Color { get; set; }

        /// <summary>
        /// Orden de visualización del estado de la tarea
        /// </summary>
        public int Orden { get; set; }

        /// <summary>
        /// Indica si el estado de la tarea representa un estado final
        /// </summary>
        public bool EsEstadoFinal { get; set; }

        /// <summary>
        /// Indica si el estado de la tarea está activo
        /// </summary>
        public bool Activo { get; set; }
    }
}