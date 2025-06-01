using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;
using ConsultCore31.Core.Entities.Seguridad;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un indicador clave de desempeño (KPI) en el sistema.
/// </summary>
[Table("Kpis", Schema = "dbo")]
public class KPI : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del KPI.
    /// </summary>
    [Key]
    [Column("kpiId")]
    [Description("Identificador único del KPI")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del KPI.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("kpiNombre")]
    [Description("Nombre del KPI")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción del KPI.
    /// </summary>
    [MaxLength(500)]
    [Column("kpiDescripcion")]
    [Description("Descripción del KPI")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del tipo de KPI.
    /// </summary>
    [Required]
    [Column("tipoKPIId")]
    [Description("Identificador del tipo de KPI")]
    public int TipoKPIId { get; set; }

    /// <summary>
    /// Obtiene o establece la unidad de medida del KPI.
    /// </summary>
    [MaxLength(50)]
    [Column("kpiUnidad")]
    [Description("Unidad de medida del KPI")]
    public string? Unidad { get; set; }

    /// <summary>
    /// Obtiene o establece el valor base o inicial del KPI.
    /// </summary>
    [Column("kpiValorBase")]
    [Description("Valor base o inicial del KPI")]
    public decimal? ValorBase { get; set; }

    /// <summary>
    /// Obtiene o establece el valor objetivo a alcanzar del KPI.
    /// </summary>
    [Column("kpiValorObjetivo")]
    [Description("Valor objetivo a alcanzar del KPI")]
    public decimal? ValorObjetivo { get; set; }

    /// <summary>
    /// Obtiene o establece el valor mínimo aceptable del KPI.
    /// </summary>
    [Column("kpiValorMinimo")]
    [Description("Valor mínimo aceptable del KPI")]
    public decimal? ValorMinimo { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del proyecto al que pertenece el KPI.
    /// </summary>
    [Required]
    [Column("proyectoId")]
    [Description("Identificador del proyecto al que pertenece el KPI")]
    public int ProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la frecuencia de medición del KPI.
    /// </summary>
    [Required]
    [Column("frecuenciaMedicionId")]
    [Description("Identificador de la frecuencia de medición del KPI")]
    public int FrecuenciaMedicionId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de inicio de medición del KPI.
    /// </summary>
    [Column("kpiFechaInicio")]
    [Description("Fecha de inicio de medición del KPI")]
    public DateTime? FechaInicio { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de fin de medición del KPI.
    /// </summary>
    [Column("kpiFechaFin")]
    [Description("Fecha de fin de medición del KPI")]
    public DateTime? FechaFin { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el KPI está activo.
    /// </summary>
    [Required]
    [Column("kpiActivo")]
    [Description("Indica si el KPI está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece el identificador del usuario que creó el KPI.
    /// </summary>
    [Required]
    [Column("creadoPorId")]
    [Description("Identificador del usuario que creó el KPI")]
    public int CreadoPorId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de creación del KPI.
    /// </summary>
    [Required]
    [Column("kpiFechaCreacion")]
    [Description("Fecha de creación del KPI")]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;

    /// <summary>
    /// Obtiene o establece un valor que indica si el KPI es operativo.
    /// </summary>
    [Required]
    [Column("kpiEsOperativo")]
    [Description("Indica si el KPI es operativo")]
    public bool EsOperativo { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el KPI es financiero.
    /// </summary>
    [Required]
    [Column("kpiEsFinanciero")]
    [Description("Indica si el KPI es financiero")]
    public bool EsFinanciero { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al tipo de KPI.
    /// </summary>
    [ForeignKey(nameof(TipoKPIId))]
    public virtual TipoKPI? TipoKPI { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al proyecto.
    /// </summary>
    [ForeignKey(nameof(ProyectoId))]
    public virtual Proyecto? Proyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación a la frecuencia de medición.
    /// </summary>
    [ForeignKey(nameof(FrecuenciaMedicionId))]
    public virtual FrecuenciaMedicion? FrecuenciaMedicion { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario que creó el KPI.
    /// </summary>
    [ForeignKey(nameof(CreadoPorId))]
    public virtual Usuario? CreadoPor { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de mediciones del KPI.
    /// </summary>
    public virtual ICollection<MedicionKPI>? MedicionesKPI { get; set; }
}
