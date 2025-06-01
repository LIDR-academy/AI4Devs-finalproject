using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;
using ConsultCore31.Core.Entities.Seguridad;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un proyecto en el sistema.
/// </summary>
[Table("Proyectos", Schema = "dbo")]
public class Proyecto : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del proyecto.
    /// </summary>
    [Key]
    [Column("proyectoId")]
    [Description("Identificador único del proyecto")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del proyecto.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("proyectoNombre")]
    [Description("Nombre del proyecto")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el código único del proyecto.
    /// </summary>
    [MaxLength(20)]
    [Column("proyectoCodigo")]
    [Description("Código único del proyecto")]
    public string? Codigo { get; set; }

    /// <summary>
    /// Obtiene o establece la descripción del proyecto.
    /// </summary>
    [MaxLength(500)]
    [Column("proyectoDescripcion")]
    [Description("Descripción del proyecto")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de inicio del proyecto.
    /// </summary>
    [Column("proyectoFechaInicio")]
    [Description("Fecha de inicio del proyecto")]
    public DateTime? FechaInicio { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de fin planificada del proyecto.
    /// </summary>
    [Column("proyectoFechaFinPlanificada")]
    [Description("Fecha de fin planificada del proyecto")]
    public DateTime? FechaFinPlanificada { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de fin real del proyecto.
    /// </summary>
    [Column("proyectoFechaFinReal")]
    [Description("Fecha de fin real del proyecto")]
    public DateTime? FechaFinReal { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del estado del proyecto.
    /// </summary>
    [Required]
    [Column("estadoProyectoId")]
    [Description("Identificador del estado del proyecto")]
    public int EstadoProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del tipo de proyecto.
    /// </summary>
    [Required]
    [Column("tipoProyectoId")]
    [Description("Identificador del tipo de proyecto")]
    public int TipoProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del cliente asociado al proyecto.
    /// </summary>
    [Required]
    [Column("clienteId")]
    [Description("Identificador del cliente asociado al proyecto")]
    public int ClienteId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del gerente del proyecto.
    /// </summary>
    [Required]
    [Column("gerenteId")]
    [Description("Identificador del gerente del proyecto")]
    public int GerenteId { get; set; }

    /// <summary>
    /// Obtiene o establece el presupuesto asignado al proyecto.
    /// </summary>
    [Column("proyectoPresupuesto")]
    [Description("Presupuesto asignado al proyecto")]
    public decimal? Presupuesto { get; set; }

    /// <summary>
    /// Obtiene o establece el retorno de inversión objetivo del proyecto.
    /// </summary>
    [Column("proyectoROIObjetivo")]
    [Description("Retorno de inversión objetivo del proyecto")]
    public decimal? RetornoInversionObjetivo { get; set; } = 3.0m; // Por defecto 3:1 según requisitos

    /// <summary>
    /// Obtiene o establece el porcentaje de avance del proyecto.
    /// </summary>
    [Column("proyectoPorcentajeAvance")]
    [Description("Porcentaje de avance del proyecto")]
    public decimal? PorcentajeAvance { get; set; } = 0;

    /// <summary>
    /// Obtiene o establece un valor que indica si el proyecto está activo.
    /// </summary>
    [Required]
    [Column("proyectoActivo")]
    [Description("Indica si el proyecto está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece el identificador del objeto asociado.
    /// </summary>
    [Required]
    [Column("objetoId")]
    [Description("Identificador del objeto asociado")]
    public int ObjetoId { get; set; } = 3; // Valor predeterminado para objeto de tipo Proyecto

    /// <summary>
    /// Obtiene o establece la navegación al estado del proyecto.
    /// </summary>
    [ForeignKey(nameof(EstadoProyectoId))]
    public virtual EstadoProyecto? EstadoProyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al tipo de proyecto.
    /// </summary>
    [ForeignKey(nameof(TipoProyectoId))]
    public virtual TipoProyecto? TipoProyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al cliente.
    /// </summary>
    [ForeignKey(nameof(ClienteId))]
    public virtual Cliente? Cliente { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al gerente del proyecto.
    /// </summary>
    [ForeignKey(nameof(GerenteId))]
    public virtual Usuario? Gerente { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al objeto asociado.
    /// </summary>
    [ForeignKey(nameof(ObjetoId))]
    public virtual Objeto? Objeto { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de etapas del proyecto.
    /// </summary>
    public virtual ICollection<EtapaProyecto>? EtapasProyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de tareas asociadas al proyecto.
    /// </summary>
    public virtual ICollection<Tarea>? Tareas { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de documentos asociados al proyecto.
    /// </summary>
    public virtual ICollection<Documento>? Documentos { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de KPIs asociados al proyecto.
    /// </summary>
    public virtual ICollection<KPI>? KPIs { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de gastos asociados al proyecto.
    /// </summary>
    public virtual ICollection<Gasto>? Gastos { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de asignaciones de viáticos asociadas al proyecto.
    /// </summary>
    public virtual ICollection<AsignacionViatico>? AsignacionesViatico { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de informes semanales asociados al proyecto.
    /// </summary>
    public virtual ICollection<InformeSemanal>? InformesSemanales { get; set; }
}
