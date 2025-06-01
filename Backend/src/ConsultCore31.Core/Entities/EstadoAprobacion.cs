using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa los posibles estados de aprobación para elementos que requieren aprobación en el sistema.
/// </summary>
[Table("EstadosAprobacion", Schema = "dbo")]
public class EstadoAprobacion : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del estado de aprobación.
    /// </summary>
    [Key]
    [Column("estadoAprobacionId")]
    [Description("Identificador único del estado de aprobación")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del estado de aprobación.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("estadoAprobacionNombre")]
    [Description("Nombre del estado de aprobación")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción del estado de aprobación.
    /// </summary>
    [MaxLength(200)]
    [Column("estadoAprobacionDescripcion")]
    [Description("Descripción del estado de aprobación")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el color asociado al estado de aprobación (en formato hexadecimal).
    /// </summary>
    [MaxLength(7)]
    [Column("estadoAprobacionColor")]
    [Description("Color asociado al estado de aprobación")]
    public string? Color { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el estado de aprobación representa una aprobación.
    /// </summary>
    [Required]
    [Column("estadoAprobacionEsAprobado")]
    [Description("Indica si el estado de aprobación representa una aprobación")]
    public bool EsAprobado { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el estado de aprobación representa un rechazo.
    /// </summary>
    [Required]
    [Column("estadoAprobacionEsRechazado")]
    [Description("Indica si el estado de aprobación representa un rechazo")]
    public bool EsRechazado { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el estado de aprobación está activo.
    /// </summary>
    [Required]
    [Column("estadoAprobacionActivo")]
    [Description("Indica si el estado de aprobación está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de gastos con este estado de aprobación.
    /// </summary>
    public virtual ICollection<Gasto>? Gastos { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de informes con este estado de aprobación.
    /// </summary>
    public virtual ICollection<InformeSemanal>? InformeSemanales { get; set; }
}
