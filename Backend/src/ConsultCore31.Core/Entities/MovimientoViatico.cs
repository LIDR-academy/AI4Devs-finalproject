using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;
using ConsultCore31.Core.Entities.Seguridad;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un movimiento de viático en el sistema.
/// </summary>
[Table("MovimientosViatico", Schema = "dbo")]
public class MovimientoViatico : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del movimiento de viático.
    /// </summary>
    [Key]
    [Column("movimientoViaticoId")]
    [Description("Identificador único del movimiento de viático")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la asignación de viático a la que pertenece el movimiento.
    /// </summary>
    [Required]
    [Column("asignacionViaticoId")]
    [Description("Identificador de la asignación de viático a la que pertenece el movimiento")]
    public int AsignacionViaticoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del tipo de movimiento de viático.
    /// </summary>
    [Required]
    [Column("tipoMovimientoViaticoId")]
    [Description("Identificador del tipo de movimiento de viático")]
    public int TipoMovimientoViaticoId { get; set; }

    /// <summary>
    /// Obtiene o establece el concepto o descripción del movimiento de viático.
    /// </summary>
    [Required]
    [MaxLength(200)]
    [Column("movimientoViaticoConcepto")]
    [Description("Concepto o descripción del movimiento de viático")]
    public string Concepto { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el monto del movimiento de viático.
    /// </summary>
    [Required]
    [Column("movimientoViaticoMonto")]
    [Description("Monto del movimiento de viático")]
    public decimal Monto { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha del movimiento de viático.
    /// </summary>
    [Required]
    [Column("movimientoViaticoFecha")]
    [Description("Fecha del movimiento de viático")]
    public DateTime Fecha { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la categoría del gasto.
    /// </summary>
    [Column("categoriaGastoId")]
    [Description("Identificador de la categoría del gasto")]
    public int? CategoriaGastoId { get; set; }

    /// <summary>
    /// Obtiene o establece la ruta del comprobante del movimiento de viático.
    /// </summary>
    [MaxLength(500)]
    [Column("movimientoViaticoRutaComprobante")]
    [Description("Ruta del comprobante del movimiento de viático")]
    public string? RutaComprobante { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del usuario que registró el movimiento de viático.
    /// </summary>
    [Required]
    [Column("registradoPorId")]
    [Description("Identificador del usuario que registró el movimiento de viático")]
    public int RegistradoPorId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de registro del movimiento de viático.
    /// </summary>
    [Required]
    [Column("movimientoViaticoFechaRegistro")]
    [Description("Fecha de registro del movimiento de viático")]
    public DateTime FechaRegistro { get; set; } = DateTime.Now;

    /// <summary>
    /// Obtiene o establece los comentarios sobre el movimiento de viático.
    /// </summary>
    [MaxLength(500)]
    [Column("movimientoViaticoComentarios")]
    [Description("Comentarios sobre el movimiento de viático")]
    public string? Comentarios { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el movimiento de viático está activo.
    /// </summary>
    [Required]
    [Column("movimientoViaticoActivo")]
    [Description("Indica si el movimiento de viático está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación a la asignación de viático.
    /// </summary>
    [ForeignKey(nameof(AsignacionViaticoId))]
    public virtual AsignacionViatico? AsignacionViatico { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al tipo de movimiento de viático.
    /// </summary>
    [ForeignKey(nameof(TipoMovimientoViaticoId))]
    public virtual TipoMovimientoViatico? TipoMovimientoViatico { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación a la categoría del gasto.
    /// </summary>
    [ForeignKey(nameof(CategoriaGastoId))]
    public virtual CategoriaGasto? CategoriaGasto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario que registró el movimiento de viático.
    /// </summary>
    [ForeignKey(nameof(RegistradoPorId))]
    public virtual Usuario? RegistradoPor { get; set; }
}
