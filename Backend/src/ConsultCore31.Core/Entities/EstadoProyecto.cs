using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa los posibles estados de un proyecto en el sistema.
/// </summary>
[Table("EstadosProyecto", Schema = "dbo")]
public class EstadoProyecto : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del estado del proyecto.
    /// </summary>
    [Key]
    [Column("estadoProyectoId")]
    [Description("Identificador único del estado del proyecto")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del estado del proyecto.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("estadoProyectoNombre")]
    [Description("Nombre del estado del proyecto")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción del estado del proyecto.
    /// </summary>
    [MaxLength(200)]
    [Column("estadoProyectoDescripcion")]
    [Description("Descripción del estado del proyecto")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el color asociado al estado del proyecto (en formato hexadecimal).
    /// </summary>
    [MaxLength(7)]
    [Column("estadoProyectoColor")]
    [Description("Color asociado al estado del proyecto")]
    public string? Color { get; set; }

    /// <summary>
    /// Obtiene o establece el orden de visualización del estado del proyecto.
    /// </summary>
    [Required]
    [Column("estadoProyectoOrden")]
    [Description("Orden de visualización del estado del proyecto")]
    public int Orden { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el estado del proyecto representa un estado final.
    /// </summary>
    [Required]
    [Column("estadoProyectoEsFinal")]
    [Description("Indica si el estado del proyecto representa un estado final")]
    public bool EsEstadoFinal { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el estado del proyecto está activo.
    /// </summary>
    [Required]
    [Column("estadoProyectoActivo")]
    [Description("Indica si el estado del proyecto está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de proyectos que tienen este estado.
    /// </summary>
    public virtual ICollection<Proyecto>? Proyectos { get; set; }
}