using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Proyecto
{
    /// <summary>
    /// DTO para actualizar un proyecto existente en el sistema
    /// </summary>
    public class UpdateProyectoDto
    {
        /// <summary>
        /// Identificador único del proyecto
        /// </summary>
        [Required(ErrorMessage = "El identificador del proyecto es obligatorio")]
        public int Id { get; set; }

        /// <summary>
        /// Nombre del proyecto
        /// </summary>
        [Required(ErrorMessage = "El nombre del proyecto es obligatorio")]
        [MaxLength(100, ErrorMessage = "El nombre del proyecto no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Código único del proyecto
        /// </summary>
        [MaxLength(20, ErrorMessage = "El código del proyecto no puede exceder los 20 caracteres")]
        public string? Codigo { get; set; }

        /// <summary>
        /// Descripción del proyecto
        /// </summary>
        [MaxLength(500, ErrorMessage = "La descripción del proyecto no puede exceder los 500 caracteres")]
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
        [Required(ErrorMessage = "El estado del proyecto es obligatorio")]
        public int EstadoProyectoId { get; set; }

        /// <summary>
        /// Identificador del tipo de proyecto
        /// </summary>
        [Required(ErrorMessage = "El tipo de proyecto es obligatorio")]
        public int TipoProyectoId { get; set; }

        /// <summary>
        /// Identificador del cliente asociado al proyecto
        /// </summary>
        [Required(ErrorMessage = "El cliente del proyecto es obligatorio")]
        public int ClienteId { get; set; }

        /// <summary>
        /// Identificador del gerente del proyecto
        /// </summary>
        [Required(ErrorMessage = "El gerente del proyecto es obligatorio")]
        public int GerenteId { get; set; }

        /// <summary>
        /// Presupuesto asignado al proyecto
        /// </summary>
        [Range(0, double.MaxValue, ErrorMessage = "El presupuesto debe ser un valor positivo")]
        public decimal? Presupuesto { get; set; }

        /// <summary>
        /// Retorno de inversión objetivo del proyecto
        /// </summary>
        [Range(0, double.MaxValue, ErrorMessage = "El retorno de inversión objetivo debe ser un valor positivo")]
        public decimal? RetornoInversionObjetivo { get; set; }

        /// <summary>
        /// Porcentaje de avance del proyecto
        /// </summary>
        [Range(0, 100, ErrorMessage = "El porcentaje de avance debe estar entre 0 y 100")]
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