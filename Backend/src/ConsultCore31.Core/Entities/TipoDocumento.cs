using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa los tipos de documentos que pueden ser gestionados en el sistema.
/// </summary>
[Table("TiposDocumento", Schema = "dbo")]
public class TipoDocumento : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece un valor que indica si el tipo de documento está activo.
    /// </summary>
    [Required]
    [Column("tipoDocumentoActivo")]
    [Description("Indica si el tipo de documento está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la descripción del tipo de documento.
    /// </summary>
    [Required]
    [MaxLength(1000)]
    [Column("tipoDocumentoDescripcion")]
    [Description("Descripción del tipo de documento")]
    public string Descripcion { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la colección de documentos de este tipo.
    /// </summary>
    public virtual ICollection<Documento>? Documentos { get; set; }

    /// <summary>
    /// Obtiene o establece las extensiones de archivo permitidas para este tipo de documento (separadas por comas).
    /// </summary>
    [Required]
    [MaxLength(1000)]
    [Column("tipoDocumentoExtensionesPermitidas")]
    [Description("Extensiones de archivo permitidas para este tipo de documento")]
    public string ExtensionesPermitidas { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la fecha de creación del registro.
    /// </summary>
    [Required]
    [Column("fechaCreacion")]
    [Description("Fecha de creación del registro")]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;

    /// <summary>
    /// Obtiene o establece la fecha de última modificación del registro.
    /// </summary>
    [Column("fechaModificacion")]
    [Description("Fecha de última modificación del registro")]
    public DateTime? FechaModificacion { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador único del tipo de documento.
    /// </summary>
    [Key]
    [Column("tipoDocumentoId")]
    [Description("Identificador único del tipo de documento")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del tipo de documento.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("tipoDocumentoNombre")]
    [Description("Nombre del tipo de documento")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el tamaño máximo permitido en megabytes para este tipo de documento.
    /// </summary>
    [Column("tipoDocumentoTamanoMaximoMB")]
    [Description("Tamaño máximo permitido en megabytes para este tipo de documento")]
    public decimal? TamanoMaximoMB { get; set; }
}