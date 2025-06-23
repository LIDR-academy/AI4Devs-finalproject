using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa una etapa de un proyecto en el sistema.
/// </summary>
[Table("EtapasProyecto", Schema = "dbo")]
public class EtapaProyecto : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único de la etapa del proyecto.
    /// </summary>
    [Key]
    [Column("etapaProyectoId")]
    [Description("Identificador único de la etapa del proyecto")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del proyecto al que pertenece la etapa.
    /// </summary>
    [Required]
    [Column("proyectoId")]
    [Description("Identificador del proyecto al que pertenece la etapa")]
    public int ProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre de la etapa.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("etapaProyectoNombre")]
    [Description("Nombre de la etapa")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción de la etapa.
    /// </summary>
    [MaxLength(500)]
    [Column("etapaProyectoDescripcion")]
    [Description("Descripción de la etapa")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el orden de la etapa en el proyecto.
    /// </summary>
    [Required]
    [Column("etapaProyectoOrden")]
    [Description("Orden de la etapa en el proyecto")]
    public int Orden { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de inicio planificada de la etapa.
    /// </summary>
    [Column("etapaProyectoFechaInicio")]
    [Description("Fecha de inicio planificada de la etapa")]
    public DateTime? FechaInicio { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de fin planificada de la etapa.
    /// </summary>
    [Column("etapaProyectoFechaFin")]
    [Description("Fecha de fin planificada de la etapa")]
    public DateTime? FechaFin { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de inicio real de la etapa.
    /// </summary>
    [Column("etapaProyectoFechaInicioReal")]
    [Description("Fecha de inicio real de la etapa")]
    public DateTime? FechaInicioReal { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de fin real de la etapa.
    /// </summary>
    [Column("etapaProyectoFechaFinReal")]
    [Description("Fecha de fin real de la etapa")]
    public DateTime? FechaFinReal { get; set; }

    /// <summary>
    /// Obtiene o establece el porcentaje de completitud de la etapa.
    /// </summary>
    [Column("etapaProyectoPorcentajeCompletado")]
    [Description("Porcentaje de completitud de la etapa")]
    public decimal? PorcentajeCompletado { get; set; } = 0;

    /// <summary>
    /// Obtiene o establece el identificador del estado de la etapa.
    /// </summary>
    [Required]
    [Column("estadoEtapaId")]
    [Description("Identificador del estado de la etapa")]
    public int EstadoEtapaId { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la etapa es predefinida del sistema.
    /// </summary>
    [Required]
    [Column("etapaProyectoEsPredefinida")]
    [Description("Indica si la etapa es predefinida del sistema")]
    public bool EsPredefinida { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la etapa está activa.
    /// </summary>
    [Required]
    [Column("etapaProyectoActiva")]
    [Description("Indica si la etapa está activa")]
    public bool Activa { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al proyecto.
    /// </summary>
    [ForeignKey(nameof(ProyectoId))]
    public virtual Proyecto? Proyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al estado de la etapa.
    /// </summary>
    [ForeignKey(nameof(EstadoEtapaId))]
    public virtual EstadoEtapa? EstadoEtapa { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de tareas asociadas a la etapa.
    /// </summary>
    public virtual ICollection<Tarea>? Tareas { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de documentos asociados a la etapa.
    /// </summary>
    public virtual ICollection<Documento>? Documentos { get; set; }
}