using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa las monedas disponibles para operaciones financieras en el sistema.
/// </summary>
[Table("Monedas", Schema = "dbo")]
public class Moneda : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único de la moneda.
    /// </summary>
    [Key]
    [Column("monedaId")]
    [Description("Identificador único de la moneda")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el código ISO de la moneda.
    /// </summary>
    [Required]
    [MaxLength(3)]
    [Column("monedaCodigo")]
    [Description("Código ISO de la moneda")]
    public string Codigo { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el nombre de la moneda.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("monedaNombre")]
    [Description("Nombre de la moneda")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el símbolo de la moneda.
    /// </summary>
    [MaxLength(5)]
    [Column("monedaSimbolo")]
    [Description("Símbolo de la moneda")]
    public string? Simbolo { get; set; }

    /// <summary>
    /// Obtiene o establece la tasa de cambio respecto a la moneda base del sistema.
    /// </summary>
    [Required]
    [Column("monedaTasaCambio")]
    [Description("Tasa de cambio respecto a la moneda base del sistema")]
    public decimal TasaCambio { get; set; } = 1;

    /// <summary>
    /// Obtiene o establece la fecha de actualización de la tasa de cambio.
    /// </summary>
    [Column("monedaFechaActualizacion")]
    [Description("Fecha de actualización de la tasa de cambio")]
    public DateTime? FechaActualizacion { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si es la moneda predeterminada del sistema.
    /// </summary>
    [Required]
    [Column("monedaEsPredeterminada")]
    [Description("Indica si es la moneda predeterminada del sistema")]
    public bool EsPredeterminada { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la moneda está activa.
    /// </summary>
    [Required]
    [Column("monedaActiva")]
    [Description("Indica si la moneda está activa")]
    public bool Activa { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de gastos en esta moneda.
    /// </summary>
    public virtual ICollection<Gasto>? Gastos { get; set; }
}