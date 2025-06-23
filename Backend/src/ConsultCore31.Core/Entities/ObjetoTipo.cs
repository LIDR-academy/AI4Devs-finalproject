using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un tipo de objeto en el sistema.
/// </summary>
[Table("ObjetoTipos", Schema = "dbo")]
public class ObjetoTipo : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del tipo de objeto.
    /// </summary>
    [Key]
    [Column("objetoTipoId")]
    [Description("Identificador único del tipo de objeto")]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del tipo de objeto.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("objetoTipoNombre")]
    [Description("Nombre del tipo de objeto")]
    public string ObjetoTipoNombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece un valor que indica si el objeto está activo.
    /// </summary>
    [Required]
    [Column("ObjetoTipoActivo")]
    [Description("Indica si el objeto tipo   está activo")]
    public bool ObjetoTipoActivo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de objetos asociados a este tipo.
    /// </summary>
    public virtual ICollection<Objeto> Objetos { get; set; } = new List<Objeto>();
}