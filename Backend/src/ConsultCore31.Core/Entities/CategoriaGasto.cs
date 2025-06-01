using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa las categorías de gastos disponibles en el sistema.
/// </summary>
[Table("CategoriasGasto", Schema = "dbo")]
public class CategoriaGasto : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único de la categoría de gasto.
    /// </summary>
    [Key]
    [Column("categoriaGastoId")]
    [Description("Identificador único de la categoría de gasto")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre de la categoría de gasto.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("categoriaGastoNombre")]
    [Description("Nombre de la categoría de gasto")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción de la categoría de gasto.
    /// </summary>
    [MaxLength(200)]
    [Column("categoriaGastoDescripcion")]
    [Description("Descripción de la categoría de gasto")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la categoría de gasto es estándar del sistema.
    /// </summary>
    [Required]
    [Column("categoriaGastoEsEstandar")]
    [Description("Indica si la categoría de gasto es estándar del sistema")]
    public bool EsEstandar { get; set; } = true;

    /// <summary>
    /// Obtiene o establece un valor que indica si la categoría de gasto requiere comprobante.
    /// </summary>
    [Required]
    [Column("categoriaGastoRequiereComprobante")]
    [Description("Indica si la categoría de gasto requiere comprobante")]
    public bool RequiereComprobante { get; set; } = true;

    /// <summary>
    /// Obtiene o establece el límite máximo permitido para esta categoría de gasto.
    /// </summary>
    [Column("categoriaGastoLimiteMaximo")]
    [Description("Límite máximo permitido para esta categoría de gasto")]
    public decimal? LimiteMaximo { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la categoría de gasto está activa.
    /// </summary>
    [Required]
    [Column("categoriaGastoActiva")]
    [Description("Indica si la categoría de gasto está activa")]
    public bool Activa { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de gastos asociados a esta categoría.
    /// </summary>
    public virtual ICollection<Gasto>? Gastos { get; set; }
}
