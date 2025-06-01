using System;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.EtapaProyecto
{
    /// <summary>
    /// DTO para actualizar una etapa de proyecto existente
    /// </summary>
    public class UpdateEtapaProyectoDto
    {
        /// <summary>
        /// Identificador único de la etapa del proyecto
        /// </summary>
        [Required(ErrorMessage = "El identificador de la etapa es obligatorio")]
        public int Id { get; set; }

        /// <summary>
        /// Identificador del proyecto al que pertenece la etapa
        /// </summary>
        [Required(ErrorMessage = "El identificador del proyecto es obligatorio")]
        public int ProyectoId { get; set; }

        /// <summary>
        /// Nombre de la etapa
        /// </summary>
        [Required(ErrorMessage = "El nombre de la etapa es obligatorio")]
        [StringLength(100, ErrorMessage = "El nombre de la etapa no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción de la etapa
        /// </summary>
        [StringLength(500, ErrorMessage = "La descripción de la etapa no puede exceder los 500 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Orden de la etapa en el proyecto
        /// </summary>
        [Required(ErrorMessage = "El orden de la etapa es obligatorio")]
        public int Orden { get; set; }

        /// <summary>
        /// Fecha de inicio planificada de la etapa
        /// </summary>
        public DateTime? FechaInicio { get; set; }

        /// <summary>
        /// Fecha de fin planificada de la etapa
        /// </summary>
        public DateTime? FechaFin { get; set; }

        /// <summary>
        /// Fecha de inicio real de la etapa
        /// </summary>
        public DateTime? FechaInicioReal { get; set; }

        /// <summary>
        /// Fecha de fin real de la etapa
        /// </summary>
        public DateTime? FechaFinReal { get; set; }

        /// <summary>
        /// Porcentaje de completitud de la etapa
        /// </summary>
        [Range(0, 100, ErrorMessage = "El porcentaje de completitud debe estar entre 0 y 100")]
        public decimal? PorcentajeCompletado { get; set; }

        /// <summary>
        /// Identificador del estado de la etapa
        /// </summary>
        [Required(ErrorMessage = "El identificador del estado de la etapa es obligatorio")]
        public int EstadoEtapaId { get; set; }

        /// <summary>
        /// Indica si la etapa es predefinida del sistema
        /// </summary>
        public bool EsPredefinida { get; set; }

        /// <summary>
        /// Indica si la etapa está activa
        /// </summary>
        public bool Activa { get; set; }
    }
}
