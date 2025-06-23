using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa los posibles estados de una etapa de proyecto en el sistema.
/// </summary>
[Table("EstadosEtapa", Schema = "dbo")]
public class EstadoEtapa : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del estado de la etapa.
    /// </summary>
    [Key]
    [Column("estadoEtapaId")]
    [Description("Identificador único del estado de la etapa")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del estado de la etapa.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("estadoEtapaNombre")]
    [Description("Nombre del estado de la etapa")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción del estado de la etapa.
    /// </summary>
    [MaxLength(200)]
    [Column("estadoEtapaDescripcion")]
    [Description("Descripción del estado de la etapa")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el color asociado al estado de la etapa (en formato hexadecimal).
    /// </summary>
    [MaxLength(7)]
    [Column("estadoEtapaColor")]
    [Description("Color asociado al estado de la etapa")]
    public string? Color { get; set; }

    /// <summary>
    /// Obtiene o establece el orden de visualización del estado de la etapa.
    /// </summary>
    [Required]
    [Column("estadoEtapaOrden")]
    [Description("Orden de visualización del estado de la etapa")]
    public int Orden { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el estado de la etapa representa un estado final.
    /// </summary>
    [Required]
    [Column("estadoEtapaEsFinal")]
    [Description("Indica si el estado de la etapa representa un estado final")]
    public bool EsEstadoFinal { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el estado de la etapa está activo.
    /// </summary>
    [Required]
    [Column("estadoEtapaActivo")]
    [Description("Indica si el estado de la etapa está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de etapas de proyecto que tienen este estado.
    /// </summary>
    public virtual ICollection<EtapaProyecto>? EtapasProyecto { get; set; }
}