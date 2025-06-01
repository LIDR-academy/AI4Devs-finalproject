using System;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Tarea
{
    /// <summary>
    /// DTO para actualizar una tarea existente
    /// </summary>
    public class UpdateTareaDto
    {
        /// <summary>
        /// Identificador único de la tarea
        /// </summary>
        [Required(ErrorMessage = "El identificador de la tarea es obligatorio")]
        public int Id { get; set; }

        /// <summary>
        /// Título de la tarea
        /// </summary>
        [Required(ErrorMessage = "El título de la tarea es obligatorio")]
        [StringLength(100, ErrorMessage = "El título de la tarea no puede exceder los 100 caracteres")]
        public string Titulo { get; set; } = string.Empty;

        /// <summary>
        /// Descripción de la tarea
        /// </summary>
        [StringLength(500, ErrorMessage = "La descripción de la tarea no puede exceder los 500 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Identificador del proyecto al que pertenece la tarea
        /// </summary>
        [Required(ErrorMessage = "El identificador del proyecto es obligatorio")]
        public int ProyectoId { get; set; }

        /// <summary>
        /// Identificador de la etapa a la que pertenece la tarea
        /// </summary>
        public int? EtapaProyectoId { get; set; }

        /// <summary>
        /// Identificador del estado de la tarea
        /// </summary>
        [Required(ErrorMessage = "El identificador del estado de la tarea es obligatorio")]
        public int EstadoTareaId { get; set; }

        /// <summary>
        /// Identificador de la prioridad de la tarea
        /// </summary>
        [Required(ErrorMessage = "El identificador de la prioridad de la tarea es obligatorio")]
        public int PrioridadTareaId { get; set; }

        /// <summary>
        /// Fecha de vencimiento de la tarea
        /// </summary>
        public DateTime? FechaVencimiento { get; set; }

        /// <summary>
        /// Fecha de completitud de la tarea
        /// </summary>
        public DateTime? FechaCompletada { get; set; }

        /// <summary>
        /// Porcentaje de completitud de la tarea
        /// </summary>
        [Range(0, 100, ErrorMessage = "El porcentaje de completitud debe estar entre 0 y 100")]
        public decimal? PorcentajeCompletado { get; set; }

        /// <summary>
        /// Identificador del usuario asignado a la tarea
        /// </summary>
        public int? AsignadoAId { get; set; }

        /// <summary>
        /// Indica si la tarea es un recordatorio
        /// </summary>
        public bool EsRecordatorio { get; set; }

        /// <summary>
        /// Fecha del recordatorio
        /// </summary>
        public DateTime? FechaRecordatorio { get; set; }

        /// <summary>
        /// Indica si la tarea es privada
        /// </summary>
        public bool EsPrivada { get; set; }

        /// <summary>
        /// Indica si la tarea tiene archivos adjuntos
        /// </summary>
        public bool TieneArchivosAdjuntos { get; set; }

        /// <summary>
        /// Indica si la tarea está activa
        /// </summary>
        public bool Activa { get; set; }
    }
}
