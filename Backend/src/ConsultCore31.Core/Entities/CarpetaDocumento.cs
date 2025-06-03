using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;
using ConsultCore31.Core.Entities.Seguridad;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa una carpeta para organizar documentos en el sistema.
/// </summary>
[Table("CarpetasDocumento", Schema = "dbo")]
public class CarpetaDocumento : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único de la carpeta de documentos.
    /// </summary>
    [Key]
    [Column("carpetaDocumentoId")]
    [Description("Identificador único de la carpeta de documentos")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre de la carpeta de documentos.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("carpetaDocumentoNombre")]
    [Description("Nombre de la carpeta de documentos")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción de la carpeta de documentos.
    /// </summary>
    [MaxLength(500)]
    [Column("carpetaDocumentoDescripcion")]
    [Description("Descripción de la carpeta de documentos")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del proyecto al que pertenece la carpeta de documentos.
    /// </summary>
    [Required]
    [Column("proyectoId")]
    [Description("Identificador del proyecto al que pertenece la carpeta de documentos")]
    public int ProyectoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la carpeta padre.
    /// </summary>
    [Column("carpetaPadreId")]
    [Description("Identificador de la carpeta padre")]
    public int? CarpetaPadreId { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de creación de la carpeta de documentos.
    /// </summary>
    [Required]
    [Column("carpetaDocumentoFechaCreacion")]
    [Description("Fecha de creación de la carpeta de documentos")]
    public new DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Obtiene o establece el identificador del usuario que creó la carpeta de documentos.
    /// </summary>
    [Required]
    [Column("creadoPorId")]
    [Description("Identificador del usuario que creó la carpeta de documentos")]
    public int CreadoPorId { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la carpeta de documentos está activa.
    /// </summary>
    [Required]
    [Column("carpetaDocumentoActiva")]
    [Description("Indica si la carpeta de documentos está activa")]
    public bool Activa { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al proyecto.
    /// </summary>
    [ForeignKey(nameof(ProyectoId))]
    public virtual Proyecto? Proyecto { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación a la carpeta padre.
    /// </summary>
    [ForeignKey(nameof(CarpetaPadreId))]
    public virtual CarpetaDocumento? CarpetaPadre { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario que creó la carpeta de documentos.
    /// </summary>
    [ForeignKey(nameof(CreadoPorId))]
    public virtual Usuario? CreadoPor { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de carpetas hijas.
    /// </summary>
    public virtual ICollection<CarpetaDocumento>? CarpetasHijas { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de documentos en esta carpeta.
    /// </summary>
    public virtual ICollection<Documento>? Documentos { get; set; }
}
