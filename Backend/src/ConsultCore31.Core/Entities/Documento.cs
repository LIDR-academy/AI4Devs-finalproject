using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un documento en el sistema.
/// </summary>
[Table("Documentos", Schema = "dbo")]
public class Documento : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del documento.
    /// </summary>
    [Key]
    [Column("documentoId")]
    [Description("Identificador único del documento")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del documento.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("documentoNombre")]
    [Description("Nombre del documento")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción del documento.
    /// </summary>
    [MaxLength(500)]
    [Column("documentoDescripcion")]
    [Description("Descripción del documento")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece la ruta de almacenamiento del documento.
    /// </summary>
    [Required]
    [MaxLength(500)]
    [Column("documentoRutaAlmacenamiento")]
    [Description("Ruta de almacenamiento del documento")]
    public string RutaAlmacenamiento { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el nombre del archivo en el sistema.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("documentoNombreArchivo")]
    [Description("Nombre del archivo en el sistema")]
    public string NombreArchivo { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la extensión del documento.
    /// </summary>
    [MaxLength(10)]
    [Column("documentoExtension")]
    [Description("Extensión del documento")]
    public string? Extension { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del tipo de documento.
    /// </summary>
    [Required]
    [Column("tipoDocumentoId")]
    [Description("Identificador del tipo de documento")]
    public int TipoDocumentoId { get; set; }

    /// <summary>
    /// Obtiene o establece el tamaño en bytes del documento.
    /// </summary>
    [Column("documentoTamano")]
    [Description("Tamaño en bytes del documento")]
    public long? Tamano { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de subida del documento.
    /// </summary>
    [Required]
    [Column("documentoFechaSubida")]
    [Description("Fecha de subida del documento")]
    public DateTime FechaSubida { get; set; } = DateTime.Now;

    /// <summary>
    /// Obtiene o establece la fecha de última modificación del documento.
    /// </summary>
    [Column("documentoFechaModificacion")]
    [Description("Fecha de última modificación del documento")]
    public DateTime? FechaModificacion { get; set; }

    /// <summary>
    /// Obtiene o establece el número de versión actual del documento.
    /// </summary>
    [Required]
    [Column("documentoVersionActual")]
    [Description("Número de versión actual del documento")]
    public int VersionActual { get; set; } = 1;

    /// <summary>
    /// Obtiene o establece el identificador del proyecto al que pertenece el documento.
    /// </summary>
    [Required]
    [Column("proyectoId")]
    [Description("Identificador del proyecto al que pertenece el documento")]
    public int ProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la etapa a la que pertenece el documento.
    /// </summary>
    [Column("etapaProyectoId")]
    [Description("Identificador de la etapa a la que pertenece el documento")]
    public int? EtapaProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la carpeta a la que pertenece el documento.
    /// </summary>
    [Column("carpetaDocumentoId")]
    [Description("Identificador de la carpeta a la que pertenece el documento")]
    public int? CarpetaDocumentoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del usuario que subió el documento.
    /// </summary>
    [Required]
    [Column("subidoPorId")]
    [Description("Identificador del usuario que subió el documento")]
    public int SubidoPorId { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el documento es público.
    /// </summary>
    [Required]
    [Column("documentoEsPublico")]
    [Description("Indica si el documento es público")]
    public bool EsPublico { get; set; }

    /// <summary>
    /// Obtiene o establece las etiquetas del documento para facilitar búsquedas.
    /// </summary>
    [MaxLength(200)]
    [Column("documentoEtiquetas")]
    [Description("Etiquetas del documento para facilitar búsquedas")]
    public string? Etiquetas { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el documento está activo.
    /// </summary>
    [Required]
    [Column("documentoActivo")]
    [Description("Indica si el documento está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al tipo de documento.
    /// </summary>
    [ForeignKey(nameof(TipoDocumentoId))]
    public virtual TipoDocumento? TipoDocumento { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al proyecto.
    /// </summary>
    [ForeignKey(nameof(ProyectoId))]
    public virtual Proyecto? Proyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación a la etapa del proyecto.
    /// </summary>
    [ForeignKey(nameof(EtapaProyectoId))]
    public virtual EtapaProyecto? EtapaProyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación a la carpeta de documentos.
    /// </summary>
    [ForeignKey(nameof(CarpetaDocumentoId))]
    public virtual CarpetaDocumento? CarpetaDocumento { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario que subió el documento.
    /// </summary>
    [ForeignKey(nameof(SubidoPorId))]
    public virtual Usuario? SubidoPor { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de versiones del documento.
    /// </summary>
    public virtual ICollection<VersionDocumento>? VersionesDocumento { get; set; }
}