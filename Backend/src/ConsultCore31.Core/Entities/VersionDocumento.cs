using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;
using ConsultCore31.Core.Entities.Seguridad;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa una versión de un documento en el sistema.
/// </summary>
[Table("VersionesDocumento", Schema = "dbo")]
public class VersionDocumento : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único de la versión del documento.
    /// </summary>
    [Key]
    [Column("versionDocumentoId")]
    [Description("Identificador único de la versión del documento")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del documento al que pertenece la versión.
    /// </summary>
    [Required]
    [Column("documentoId")]
    [Description("Identificador del documento al que pertenece la versión")]
    public int DocumentoId { get; set; }

    /// <summary>
    /// Obtiene o establece el número de versión.
    /// </summary>
    [Required]
    [Column("versionDocumentoNumero")]
    [Description("Número de versión")]
    public int NumeroVersion { get; set; }

    /// <summary>
    /// Obtiene o establece la ruta de almacenamiento de la versión del documento.
    /// </summary>
    [Required]
    [MaxLength(500)]
    [Column("versionDocumentoRutaAlmacenamiento")]
    [Description("Ruta de almacenamiento de la versión del documento")]
    public string RutaAlmacenamiento { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el tamaño en bytes de la versión del documento.
    /// </summary>
    [Column("versionDocumentoTamano")]
    [Description("Tamaño en bytes de la versión del documento")]
    public long? Tamano { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de creación de la versión del documento.
    /// </summary>
    [Required]
    [Column("versionDocumentoFechaCreacion")]
    [Description("Fecha de creación de la versión del documento")]
    public DateTime FechaCreacion { get; set; } = DateTime.Now;

    /// <summary>
    /// Obtiene o establece el comentario sobre los cambios en la versión del documento.
    /// </summary>
    [MaxLength(500)]
    [Column("versionDocumentoComentario")]
    [Description("Comentario sobre los cambios en la versión del documento")]
    public string? Comentario { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del usuario que creó la versión del documento.
    /// </summary>
    [Required]
    [Column("usuarioId")]
    [Description("Identificador del usuario que creó la versión del documento")]
    public int UsuarioId { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si es la versión actual del documento.
    /// </summary>
    [Required]
    [Column("versionDocumentoEsVersionActual")]
    [Description("Indica si es la versión actual del documento")]
    public bool EsVersionActual { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la versión del documento está activa.
    /// </summary>
    [Required]
    [Column("versionDocumentoActiva")]
    [Description("Indica si la versión del documento está activa")]
    public bool Activa { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al documento.
    /// </summary>
    [ForeignKey(nameof(DocumentoId))]
    public virtual Documento? Documento { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario.
    /// </summary>
    [ForeignKey(nameof(UsuarioId))]
    public virtual Usuario? Usuario { get; set; }
}
