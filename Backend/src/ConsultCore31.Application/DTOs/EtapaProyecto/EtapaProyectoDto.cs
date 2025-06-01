using System;
using System.Text.Json.Serialization;

namespace ConsultCore31.Application.DTOs.EtapaProyecto
{
    /// <summary>
    /// DTO para representar una etapa de proyecto en operaciones de lectura
    /// </summary>
    public class EtapaProyectoDto
    {
        /// <summary>
        /// Identificador único de la etapa del proyecto
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Identificador del proyecto al que pertenece la etapa
        /// </summary>
        public int ProyectoId { get; set; }

        /// <summary>
        /// Nombre de la etapa
        /// </summary>
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción de la etapa
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Orden de la etapa en el proyecto
        /// </summary>
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
        public decimal? PorcentajeCompletado { get; set; }

        /// <summary>
        /// Identificador del estado de la etapa
        /// </summary>
        public int EstadoEtapaId { get; set; }

        /// <summary>
        /// Nombre del estado de la etapa
        /// </summary>
        public string? EstadoEtapaNombre { get; set; }

        /// <summary>
        /// Indica si la etapa es predefinida del sistema
        /// </summary>
        public bool EsPredefinida { get; set; }

        /// <summary>
        /// Indica si la etapa está activa
        /// </summary>
        public bool Activa { get; set; }

        /// <summary>
        /// Fecha de creación de la etapa
        /// </summary>
        public DateTime FechaCreacion { get; set; }

        /// <summary>
        /// Fecha de última modificación de la etapa
        /// </summary>
        public DateTime? FechaModificacion { get; set; }
    }
}
