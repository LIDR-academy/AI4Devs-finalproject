using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.PrioridadTarea
{
    /// <summary>
    /// DTO para representar una prioridad de tarea en respuestas de la API
    /// </summary>
    public class PrioridadTareaDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre de la prioridad de tarea
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción de la prioridad de tarea
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Color asociado a la prioridad de tarea (en formato hexadecimal)
        /// </summary>
        public string? Color { get; set; }

        /// <summary>
        /// Nivel numérico de la prioridad (mayor número indica mayor prioridad)
        /// </summary>
        public int Nivel { get; set; }

        /// <summary>
        /// Indica si la prioridad de tarea está activa
        /// </summary>
        public bool Activa { get; set; }
    }
}