using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;
using ConsultCore31.Core.Entities.Seguridad;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un informe semanal de avance de proyecto en el sistema.
/// </summary>
[Table("InformesSemanales", Schema = "dbo")]
public class InformeSemanal : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del informe semanal.
    /// </summary>
    [Key]
    [Column("informeSemanalId")]
    [Description("Identificador único del informe semanal")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del proyecto al que pertenece el informe.
    /// </summary>
    [Required]
    [Column("proyectoId")]
    [Description("Identificador del proyecto al que pertenece el informe")]
    public int ProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el título del informe semanal.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("informeSemanalTitulo")]
    [Description("Título del informe semanal")]
    public string Titulo { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la fecha de inicio del periodo que cubre el informe.
    /// </summary>
    [Required]
    [Column("informeSemanalFechaInicio")]
    [Description("Fecha de inicio del periodo que cubre el informe")]
    public DateTime FechaInicio { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de fin del periodo que cubre el informe.
    /// </summary>
    [Required]
    [Column("informeSemanalFechaFin")]
    [Description("Fecha de fin del periodo que cubre el informe")]
    public DateTime FechaFin { get; set; }

    /// <summary>
    /// Obtiene o establece el número de semana del informe.
    /// </summary>
    [Required]
    [Column("informeSemanalNumeroSemana")]
    [Description("Número de semana del informe")]
    public int NumeroSemana { get; set; }

    /// <summary>
    /// Obtiene o establece el resumen de actividades realizadas.
    /// </summary>
    [Required]
    [Column("informeSemanalResumenActividades")]
    [Description("Resumen de actividades realizadas")]
    public string ResumenActividades { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece los logros alcanzados durante la semana.
    /// </summary>
    [Column("informeSemanalLogros")]
    [Description("Logros alcanzados durante la semana")]
    public string? Logros { get; set; }

    /// <summary>
    /// Obtiene o establece los problemas o desafíos encontrados.
    /// </summary>
    [Column("informeSemanalProblemas")]
    [Description("Problemas o desafíos encontrados")]
    public string? Problemas { get; set; }

    /// <summary>
    /// Obtiene o establece las soluciones propuestas a los problemas.
    /// </summary>
    [Column("informeSemanalSoluciones")]
    [Description("Soluciones propuestas a los problemas")]
    public string? Soluciones { get; set; }

    /// <summary>
    /// Obtiene o establece las actividades planificadas para la próxima semana.
    /// </summary>
    [Column("informeSemanalActividadesProximaSemana")]
    [Description("Actividades planificadas para la próxima semana")]
    public string? ActividadesProximaSemana { get; set; }

    /// <summary>
    /// Obtiene o establece el porcentaje de avance del proyecto.
    /// </summary>
    [Required]
    [Column("informeSemanalPorcentajeAvance")]
    [Description("Porcentaje de avance del proyecto")]
    public decimal PorcentajeAvance { get; set; }

    /// <summary>
    /// Obtiene o establece los comentarios adicionales sobre el informe.
    /// </summary>
    [Column("informeSemanalComentarios")]
    [Description("Comentarios adicionales sobre el informe")]
    public string? Comentarios { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del usuario que creó el informe.
    /// </summary>
    [Required]
    [Column("creadoPorId")]
    [Description("Identificador del usuario que creó el informe")]
    public int CreadoPorId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de creación del informe.
    /// </summary>
    [Required]
    [Column("informeSemanalFechaCreacion")]
    [Description("Fecha de creación del informe")]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;

    /// <summary>
    /// Obtiene o establece el identificador del estado de aprobación del informe.
    /// </summary>
    [Required]
    [Column("estadoAprobacionId")]
    [Description("Identificador del estado de aprobación del informe")]
    public int EstadoAprobacionId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del usuario que aprobó el informe.
    /// </summary>
    [Column("aprobadoPorId")]
    [Description("Identificador del usuario que aprobó el informe")]
    public int? AprobadoPorId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de aprobación del informe.
    /// </summary>
    [Column("informeSemanalFechaAprobacion")]
    [Description("Fecha de aprobación del informe")]
    public DateTime? FechaAprobacion { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el informe semanal está activo.
    /// </summary>
    [Required]
    [Column("informeSemanalActivo")]
    [Description("Indica si el informe semanal está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al proyecto.
    /// </summary>
    [ForeignKey(nameof(ProyectoId))]
    public virtual Proyecto? Proyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario que creó el informe.
    /// </summary>
    [ForeignKey(nameof(CreadoPorId))]
    public virtual Usuario? CreadoPor { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al estado de aprobación.
    /// </summary>
    [ForeignKey(nameof(EstadoAprobacionId))]
    public virtual EstadoAprobacion? EstadoAprobacion { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario que aprobó el informe.
    /// </summary>
    [ForeignKey(nameof(AprobadoPorId))]
    public virtual Usuario? AprobadoPor { get; set; }
}
