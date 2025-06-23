using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa los tipos de proyectos disponibles en el sistema.
/// </summary>
[Table("TiposProyecto", Schema = "dbo")]
public class TipoProyecto : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del tipo de proyecto.
    /// </summary>
    [Key]
    [Column("tipoProyectoId")]
    [Description("Identificador único del tipo de proyecto")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del tipo de proyecto.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("tipoProyectoNombre")]
    [Description("Nombre del tipo de proyecto")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción del tipo de proyecto.
    /// </summary>
    [MaxLength(200)]
    [Column("tipoProyectoDescripcion")]
    [Description("Descripción del tipo de proyecto")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el tipo de proyecto está activo.
    /// </summary>
    [Required]
    [Column("tipoProyectoActivo")]
    [Description("Indica si el tipo de proyecto está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de proyectos de este tipo.
    /// </summary>
    public virtual ICollection<Proyecto>? Proyectos { get; set; }
}