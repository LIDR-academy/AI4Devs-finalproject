using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa las frecuencias de medición disponibles para los KPIs en el sistema.
/// </summary>
[Table("FrecuenciasMedicion", Schema = "dbo")]
public class FrecuenciaMedicion : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único de la frecuencia de medición.
    /// </summary>
    [Key]
    [Column("frecuenciaMedicionId")]
    [Description("Identificador único de la frecuencia de medición")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre de la frecuencia de medición.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("frecuenciaMedicionNombre")]
    [Description("Nombre de la frecuencia de medición")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción de la frecuencia de medición.
    /// </summary>
    [MaxLength(200)]
    [Column("frecuenciaMedicionDescripcion")]
    [Description("Descripción de la frecuencia de medición")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el intervalo en días que representa esta frecuencia de medición.
    /// </summary>
    [Required]
    [Column("frecuenciaMedicionIntervaloDias")]
    [Description("Intervalo en días que representa esta frecuencia de medición")]
    public int IntervaloDias { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la frecuencia de medición está activa.
    /// </summary>
    [Required]
    [Column("frecuenciaMedicionActiva")]
    [Description("Indica si la frecuencia de medición está activa")]
    public bool Activa { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de KPIs que utilizan esta frecuencia de medición.
    /// </summary>
    public virtual ICollection<KPI>? KPIs { get; set; }
}
