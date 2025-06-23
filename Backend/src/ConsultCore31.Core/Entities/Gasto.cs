using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un gasto en el sistema.
/// </summary>
[Table("Gastos", Schema = "dbo")]
public class Gasto : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del gasto.
    /// </summary>
    [Key]
    [Column("gastoId")]
    [Description("Identificador único del gasto")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el concepto o descripción del gasto.
    /// </summary>
    [Required]
    [MaxLength(200)]
    [Column("gastoConcepto")]
    [Description("Concepto o descripción del gasto")]
    public string Concepto { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el monto del gasto.
    /// </summary>
    [Required]
    [Column("gastoMonto")]
    [Description("Monto del gasto")]
    public decimal Monto { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha del gasto.
    /// </summary>
    [Required]
    [Column("gastoFecha")]
    [Description("Fecha del gasto")]
    public DateTime Fecha { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del proyecto al que pertenece el gasto.
    /// </summary>
    [Required]
    [Column("proyectoId")]
    [Description("Identificador del proyecto al que pertenece el gasto")]
    public int ProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la categoría del gasto.
    /// </summary>
    [Required]
    [Column("categoriaGastoId")]
    [Description("Identificador de la categoría del gasto")]
    public int CategoriaGastoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del empleado que realizó el gasto.
    /// </summary>
    [Required]
    [Column("empleadoId")]
    [Description("Identificador del empleado que realizó el gasto")]
    public int EmpleadoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la moneda del gasto.
    /// </summary>
    [Required]
    [Column("monedaId")]
    [Description("Identificador de la moneda del gasto")]
    public int MonedaId { get; set; }

    /// <summary>
    /// Obtiene o establece el tipo de cambio aplicado al gasto.
    /// </summary>
    [Column("gastoTipoCambio")]
    [Description("Tipo de cambio aplicado al gasto")]
    public decimal? TipoCambio { get; set; } = 1;

    /// <summary>
    /// Obtiene o establece el número de factura o comprobante del gasto.
    /// </summary>
    [MaxLength(50)]
    [Column("gastoNumeroFactura")]
    [Description("Número de factura o comprobante del gasto")]
    public string? NumeroFactura { get; set; }

    /// <summary>
    /// Obtiene o establece el proveedor del gasto.
    /// </summary>
    [MaxLength(100)]
    [Column("gastoProveedor")]
    [Description("Proveedor del gasto")]
    public string? Proveedor { get; set; }

    /// <summary>
    /// Obtiene o establece el RFC del proveedor.
    /// </summary>
    [MaxLength(13)]
    [Column("gastoProveedorRFC")]
    [Description("RFC del proveedor")]
    public string? ProveedorRFC { get; set; }

    /// <summary>
    /// Obtiene o establece la ruta del comprobante del gasto.
    /// </summary>
    [MaxLength(500)]
    [Column("gastoRutaComprobante")]
    [Description("Ruta del comprobante del gasto")]
    public string? RutaComprobante { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del estado de aprobación del gasto.
    /// </summary>
    [Required]
    [Column("estadoAprobacionId")]
    [Description("Identificador del estado de aprobación del gasto")]
    public int EstadoAprobacionId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del usuario que aprobó el gasto.
    /// </summary>
    [Column("aprobadoPorId")]
    [Description("Identificador del usuario que aprobó el gasto")]
    public int? AprobadoPorId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de aprobación del gasto.
    /// </summary>
    [Column("gastoFechaAprobacion")]
    [Description("Fecha de aprobación del gasto")]
    public DateTime? FechaAprobacion { get; set; }

    /// <summary>
    /// Obtiene o establece los comentarios sobre el gasto.
    /// </summary>
    [MaxLength(500)]
    [Column("gastoComentarios")]
    [Description("Comentarios sobre el gasto")]
    public string? Comentarios { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el gasto es reembolsable.
    /// </summary>
    [Required]
    [Column("gastoEsReembolsable")]
    [Description("Indica si el gasto es reembolsable")]
    public bool EsReembolsable { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el gasto está activo.
    /// </summary>
    [Required]
    [Column("gastoActivo")]
    [Description("Indica si el gasto está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al proyecto.
    /// </summary>
    [ForeignKey(nameof(ProyectoId))]
    public virtual Proyecto? Proyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación a la categoría del gasto.
    /// </summary>
    [ForeignKey(nameof(CategoriaGastoId))]
    public virtual CategoriaGasto? CategoriaGasto { get; set; }

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
    /// Obtiene o establece la navegación al usuario que aprobó el gasto.
    /// </summary>
    [ForeignKey(nameof(AprobadoPorId))]
    public virtual Usuario? AprobadoPor { get; set; }
}