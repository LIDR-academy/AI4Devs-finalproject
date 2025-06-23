using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa los tipos de KPIs (Indicadores Clave de Desempeño) que pueden ser utilizados en el sistema.
/// </summary>
[Table("TiposKpi", Schema = "dbo")]
public class TipoKPI : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del tipo de KPI.
    /// </summary>
    [Key]
    [Column("tipoKPIId")]
    [Description("Identificador único del tipo de KPI")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del tipo de KPI.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("tipoKPINombre")]
    [Description("Nombre del tipo de KPI")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción del tipo de KPI.
    /// </summary>
    [MaxLength(200)]
    [Column("tipoKPIDescripcion")]
    [Description("Descripción del tipo de KPI")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece la unidad de medida para este tipo de KPI.
    /// </summary>
    [MaxLength(50)]
    [Column("tipoKPIUnidad")]
    [Description("Unidad de medida para este tipo de KPI")]
    public string? Unidad { get; set; }

    /// <summary>
    /// Obtiene o establece el formato de visualización para los valores de este tipo de KPI.
    /// </summary>
    [MaxLength(50)]
    [Column("tipoKPIFormato")]
    [Description("Formato de visualización para los valores de este tipo de KPI")]
    public string? Formato { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el tipo de KPI está activo.
    /// </summary>
    [Required]
    [Column("tipoKPIActivo")]
    [Description("Indica si el tipo de KPI está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de KPIs de este tipo.
    /// </summary>
    public virtual ICollection<KPI>? KPIs { get; set; }
}