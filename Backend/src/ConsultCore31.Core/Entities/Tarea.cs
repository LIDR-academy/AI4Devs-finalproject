using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;
using ConsultCore31.Core.Entities.Seguridad;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa una tarea en el sistema.
/// </summary>
[Table("Tareas", Schema = "dbo")]
public class Tarea : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único de la tarea.
    /// </summary>
    [Key]
    [Column("tareaId")]
    [Description("Identificador único de la tarea")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el título de la tarea.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("tareaTitulo")]
    [Description("Título de la tarea")]
    public string Titulo { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción de la tarea.
    /// </summary>
    [MaxLength(500)]
    [Column("tareaDescripcion")]
    [Description("Descripción de la tarea")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del proyecto al que pertenece la tarea.
    /// </summary>
    [Required]
    [Column("proyectoId")]
    [Description("Identificador del proyecto al que pertenece la tarea")]
    public int ProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la etapa a la que pertenece la tarea.
    /// </summary>
    [Column("etapaProyectoId")]
    [Description("Identificador de la etapa a la que pertenece la tarea")]
    public int? EtapaProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del estado de la tarea.
    /// </summary>
    [Required]
    [Column("estadoTareaId")]
    [Description("Identificador del estado de la tarea")]
    public int EstadoTareaId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la prioridad de la tarea.
    /// </summary>
    [Required]
    [Column("prioridadTareaId")]
    [Description("Identificador de la prioridad de la tarea")]
    public int PrioridadTareaId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de creación de la tarea.
    /// </summary>
    [Required]
    [Column("tareaFechaCreacion")]
    [Description("Fecha de creación de la tarea")]
    public new DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Obtiene o establece la fecha de vencimiento de la tarea.
    /// </summary>
    [Column("tareaFechaVencimiento")]
    [Description("Fecha de vencimiento de la tarea")]
    public DateTime? FechaVencimiento { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de completitud de la tarea.
    /// </summary>
    [Column("tareaFechaCompletada")]
    [Description("Fecha de completitud de la tarea")]
    public DateTime? FechaCompletada { get; set; }

    /// <summary>
    /// Obtiene o establece el porcentaje de completitud de la tarea.
    /// </summary>
    [Column("tareaPorcentajeCompletado")]
    [Description("Porcentaje de completitud de la tarea")]
    public decimal? PorcentajeCompletado { get; set; } = 0;

    /// <summary>
    /// Obtiene o establece el identificador del usuario que creó la tarea.
    /// </summary>
    [Required]
    [Column("creadoPorId")]
    [Description("Identificador del usuario que creó la tarea")]
    public int CreadoPorId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del usuario asignado a la tarea.
    /// </summary>
    [Column("asignadoAId")]
    [Description("Identificador del usuario asignado a la tarea")]
    public int? AsignadoAId { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la tarea es un recordatorio.
    /// </summary>
    [Required]
    [Column("tareaEsRecordatorio")]
    [Description("Indica si la tarea es un recordatorio")]
    public bool EsRecordatorio { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha del recordatorio.
    /// </summary>
    [Column("tareaFechaRecordatorio")]
    [Description("Fecha del recordatorio")]
    public DateTime? FechaRecordatorio { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la tarea es privada.
    /// </summary>
    [Required]
    [Column("tareaEsPrivada")]
    [Description("Indica si la tarea es privada")]
    public bool EsPrivada { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la tarea tiene archivos adjuntos.
    /// </summary>
    [Required]
    [Column("tareaTieneArchivosAdjuntos")]
    [Description("Indica si la tarea tiene archivos adjuntos")]
    public bool TieneArchivosAdjuntos { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la tarea está activa.
    /// </summary>
    [Required]
    [Column("tareaActiva")]
    [Description("Indica si la tarea está activa")]
    public bool Activa { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al proyecto.
    /// </summary>
    [ForeignKey(nameof(ProyectoId))]
    public virtual Proyecto? Proyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación a la etapa del proyecto.
    /// </summary>
    [ForeignKey(nameof(EtapaProyectoId))]
    public virtual EtapaProyecto? EtapaProyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al estado de la tarea.
    /// </summary>
    [ForeignKey(nameof(EstadoTareaId))]
    public virtual EstadoTarea? EstadoTarea { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación a la prioridad de la tarea.
    /// </summary>
    [ForeignKey(nameof(PrioridadTareaId))]
    public virtual PrioridadTarea? PrioridadTarea { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario que creó la tarea.
    /// </summary>
    [ForeignKey(nameof(CreadoPorId))]
    public virtual Usuario? CreadoPor { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario asignado a la tarea.
    /// </summary>
    [ForeignKey(nameof(AsignadoAId))]
    public virtual Usuario? AsignadoA { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de comentarios de la tarea.
    /// </summary>
    public virtual ICollection<ComentarioTarea>? Comentarios { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de archivos adjuntos de la tarea.
    /// </summary>
    public virtual ICollection<ArchivoAdjunto>? ArchivosAdjuntos { get; set; }
}
