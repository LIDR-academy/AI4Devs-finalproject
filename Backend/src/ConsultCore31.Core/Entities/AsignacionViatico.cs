using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa una asignación de viático en el sistema.
/// </summary>
[Table("AsignacionesViatico", Schema = "dbo")]
public class AsignacionViatico : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único de la asignación de viático.
    /// </summary>
    [Key]
    [Column("asignacionViaticoId")]
    [Description("Identificador único de la asignación de viático")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del proyecto al que pertenece la asignación de viático.
    /// </summary>
    [Required]
    [Column("proyectoId")]
    [Description("Identificador del proyecto al que pertenece la asignación de viático")]
    public int ProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del empleado al que se le asigna el viático.
    /// </summary>
    [Required]
    [Column("empleadoId")]
    [Description("Identificador del empleado al que se le asigna el viático")]
    public int EmpleadoId { get; set; }

    /// <summary>
    /// Obtiene o establece el concepto o descripción de la asignación de viático.
    /// </summary>
    [Required]
    [MaxLength(200)]
    [Column("asignacionViaticoConcepto")]
    [Description("Concepto o descripción de la asignación de viático")]
    public string Concepto { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el monto total asignado.
    /// </summary>
    [Required]
    [Column("asignacionViaticoMontoTotal")]
    [Description("Monto total asignado")]
    public decimal MontoTotal { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la moneda de la asignación de viático.
    /// </summary>
    [Required]
    [Column("monedaId")]
    [Description("Identificador de la moneda de la asignación de viático")]
    public int MonedaId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de inicio del periodo de viáticos.
    /// </summary>
    [Required]
    [Column("asignacionViaticoFechaInicio")]
    [Description("Fecha de inicio del periodo de viáticos")]
    public DateTime FechaInicio { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de fin del periodo de viáticos.
    /// </summary>
    [Required]
    [Column("asignacionViaticoFechaFin")]
    [Description("Fecha de fin del periodo de viáticos")]
    public DateTime FechaFin { get; set; }

    /// <summary>
    /// Obtiene o establece el destino del viaje.
    /// </summary>
    [MaxLength(100)]
    [Column("asignacionViaticoDestino")]
    [Description("Destino del viaje")]
    public string? Destino { get; set; }

    /// <summary>
    /// Obtiene o establece el propósito del viaje.
    /// </summary>
    [MaxLength(500)]
    [Column("asignacionViaticoPropositoViaje")]
    [Description("Propósito del viaje")]
    public string? PropositoViaje { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del estado de aprobación de la asignación de viático.
    /// </summary>
    [Required]
    [Column("estadoAprobacionId")]
    [Description("Identificador del estado de aprobación de la asignación de viático")]
    public int EstadoAprobacionId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del usuario que aprobó la asignación de viático.
    /// </summary>
    [Column("aprobadoPorId")]
    [Description("Identificador del usuario que aprobó la asignación de viático")]
    public int? AprobadoPorId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de aprobación de la asignación de viático.
    /// </summary>
    [Column("asignacionViaticoFechaAprobacion")]
    [Description("Fecha de aprobación de la asignación de viático")]
    public DateTime? FechaAprobacion { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la asignación de viático ha sido liquidada.
    /// </summary>
    [Required]
    [Column("asignacionViaticoEsLiquidada")]
    [Description("Indica si la asignación de viático ha sido liquidada")]
    public bool EsLiquidada { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de liquidación de la asignación de viático.
    /// </summary>
    [Column("asignacionViaticoFechaLiquidacion")]
    [Description("Fecha de liquidación de la asignación de viático")]
    public DateTime? FechaLiquidacion { get; set; }

    /// <summary>
    /// Obtiene o establece el saldo pendiente de la asignación de viático.
    /// </summary>
    [Column("asignacionViaticoSaldoPendiente")]
    [Description("Saldo pendiente de la asignación de viático")]
    public decimal? SaldoPendiente { get; set; }

    /// <summary>
    /// Obtiene o establece los comentarios sobre la asignación de viático.
    /// </summary>
    [MaxLength(500)]
    [Column("asignacionViaticoComentarios")]
    [Description("Comentarios sobre la asignación de viático")]
    public string? Comentarios { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la asignación de viático está activa.
    /// </summary>
    [Required]
    [Column("asignacionViaticoActiva")]
    [Description("Indica si la asignación de viático está activa")]
    public bool Activa { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al proyecto.
    /// </summary>
    [ForeignKey(nameof(ProyectoId))]
    public virtual Proyecto? Proyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al empleado.
    /// </summary>
    [ForeignKey(nameof(EmpleadoId))]
    public virtual Empleado? Empleado { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación a la moneda.
    /// </summary>
    [ForeignKey(nameof(MonedaId))]
    public virtual Moneda? Moneda { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al estado de aprobación.
    /// </summary>
    [ForeignKey(nameof(EstadoAprobacionId))]
    public virtual EstadoAprobacion? EstadoAprobacion { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario que aprobó la asignación de viático.
    /// </summary>
    [ForeignKey(nameof(AprobadoPorId))]
    public virtual Usuario? AprobadoPor { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de movimientos de viático asociados a esta asignación.
    /// </summary>
    public virtual ICollection<MovimientoViatico>? MovimientosViatico { get; set; }
}