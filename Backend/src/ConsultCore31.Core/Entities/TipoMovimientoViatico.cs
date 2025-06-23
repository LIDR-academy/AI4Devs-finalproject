using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa los tipos de movimientos que pueden realizarse en los viáticos.
/// </summary>
[Table("TiposMovimientoViatico", Schema = "dbo")]
public class TipoMovimientoViatico : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del tipo de movimiento de viático.
    /// </summary>
    [Key]
    [Column("tipoMovimientoViaticoId")]
    [Description("Identificador único del tipo de movimiento de viático")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del tipo de movimiento de viático.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("tipoMovimientoViaticoNombre")]
    [Description("Nombre del tipo de movimiento de viático")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción del tipo de movimiento de viático.
    /// </summary>
    [MaxLength(200)]
    [Column("tipoMovimientoViaticoDescripcion")]
    [Description("Descripción del tipo de movimiento de viático")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el tipo de afectación del movimiento (positivo o negativo).
    /// </summary>
    [Required]
    [Column("tipoMovimientoViaticoAfectacion")]
    [Description("Tipo de afectación del movimiento (1: Positivo, -1: Negativo)")]
    public int Afectacion { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el tipo de movimiento de viático requiere comprobante.
    /// </summary>
    [Required]
    [Column("tipoMovimientoViaticoRequiereComprobante")]
    [Description("Indica si el tipo de movimiento de viático requiere comprobante")]
    public bool RequiereComprobante { get; set; } = true;

    /// <summary>
    /// Obtiene o establece un valor que indica si el tipo de movimiento de viático está activo.
    /// </summary>
    [Required]
    [Column("tipoMovimientoViaticoActivo")]
    [Description("Indica si el tipo de movimiento de viático está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de movimientos de viático de este tipo.
    /// </summary>
    public virtual ICollection<MovimientoViatico>? MovimientosViatico { get; set; }
}