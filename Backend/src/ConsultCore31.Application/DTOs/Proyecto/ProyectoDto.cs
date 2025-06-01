using System;
using ConsultCore31.Application.DTOs.Common;

namespace ConsultCore31.Application.DTOs.Proyecto
{
    /// <summary>
    /// DTO para representar un proyecto en el sistema
    /// </summary>
    public class ProyectoDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del proyecto
        /// </summary>
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Código único del proyecto
        /// </summary>
        public string? Codigo { get; set; }

        /// <summary>
        /// Descripción del proyecto
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Fecha de inicio del proyecto
        /// </summary>
        public DateTime? FechaInicio { get; set; }

        /// <summary>
        /// Fecha de fin planificada del proyecto
        /// </summary>
        public DateTime? FechaFinPlanificada { get; set; }

        /// <summary>
        /// Fecha de fin real del proyecto
        /// </summary>
        public DateTime? FechaFinReal { get; set; }

        /// <summary>
        /// Identificador del estado del proyecto
        /// </summary>
        public int EstadoProyectoId { get; set; }

        /// <summary>
        /// Nombre del estado del proyecto
        /// </summary>
        public string? EstadoProyectoNombre { get; set; }

        /// <summary>
        /// Identificador del tipo de proyecto
        /// </summary>
        public int TipoProyectoId { get; set; }

        /// <summary>
        /// Nombre del tipo de proyecto
        /// </summary>
        public string? TipoProyectoNombre { get; set; }

        /// <summary>
        /// Identificador del cliente asociado al proyecto
        /// </summary>
        public int ClienteId { get; set; }

        /// <summary>
        /// Nombre del cliente asociado al proyecto
        /// </summary>
        public string? ClienteNombre { get; set; }

        /// <summary>
        /// Identificador del gerente del proyecto
        /// </summary>
        public int GerenteId { get; set; }

        /// <summary>
        /// Nombre del gerente del proyecto
        /// </summary>
        public string? GerenteNombre { get; set; }

        /// <summary>
        /// Presupuesto asignado al proyecto
        /// </summary>
        public decimal? Presupuesto { get; set; }

        /// <summary>
        /// Retorno de inversión objetivo del proyecto
        /// </summary>
        public decimal? RetornoInversionObjetivo { get; set; }

        /// <summary>
        /// Porcentaje de avance del proyecto
        /// </summary>
        public decimal? PorcentajeAvance { get; set; }

        /// <summary>
        /// Indica si el proyecto está activo
        /// </summary>
        public bool Activo { get; set; }

        /// <summary>
        /// Identificador del objeto asociado
        /// </summary>
        public int ObjetoId { get; set; }
    }
}
