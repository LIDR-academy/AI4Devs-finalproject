using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa una medición de un KPI en el sistema.
/// </summary>
[Table("MedicionesKpi", Schema = "dbo")]
public class MedicionKPI : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único de la medición del KPI.
    /// </summary>
    [Key]
    [Column("medicionKPIId")]
    [Description("Identificador único de la medición del KPI")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del KPI al que pertenece la medición.
    /// </summary>
    [Required]
    [Column("kpiId")]
    [Description("Identificador del KPI al que pertenece la medición")]
    public int KPIId { get; set; }

    /// <summary>
    /// Obtiene o establece el valor de la medición.
    /// </summary>
    [Required]
    [Column("medicionKPIValor")]
    [Description("Valor de la medición")]
    public decimal Valor { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de la medición.
    /// </summary>
    [Required]
    [Column("medicionKPIFecha")]
    [Description("Fecha de la medición")]
    public DateTime FechaMedicion { get; set; }

    /// <summary>
    /// Obtiene o establece el periodo que representa la medición.
    /// </summary>
    [MaxLength(50)]
    [Column("medicionKPIPeriodo")]
    [Description("Periodo que representa la medición")]
    public string? Periodo { get; set; }

    /// <summary>
    /// Obtiene o establece los comentarios sobre la medición.
    /// </summary>
    [MaxLength(500)]
    [Column("medicionKPIComentarios")]
    [Description("Comentarios sobre la medición")]
    public string? Comentarios { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del usuario que registró la medición.
    /// </summary>
    [Required]
    [Column("usuarioId")]
    [Description("Identificador del usuario que registró la medición")]
    public int UsuarioId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de registro de la medición.
    /// </summary>
    [Required]
    [Column("medicionKPIFechaRegistro")]
    [Description("Fecha de registro de la medición")]
    public DateTime FechaRegistro { get; set; } = DateTime.Now;

    /// <summary>
    /// Obtiene o establece un valor que indica si la medición está activa.
    /// </summary>
    [Required]
    [Column("medicionKPIActiva")]
    [Description("Indica si la medición está activa")]
    public bool Activa { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al KPI.
    /// </summary>
    [ForeignKey(nameof(KPIId))]
    public virtual KPI? KPI { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario.
    /// </summary>
    [ForeignKey(nameof(UsuarioId))]
    public virtual Usuario? Usuario { get; set; }
}