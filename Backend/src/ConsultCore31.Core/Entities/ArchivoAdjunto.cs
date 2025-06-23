using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un archivo adjunto en el sistema.
/// </summary>
[Table("ArchivosAdjuntos", Schema = "dbo")]
public class ArchivoAdjunto : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del archivo adjunto.
    /// </summary>
    [Key]
    [Column("archivoAdjuntoId")]
    [Description("Identificador único del archivo adjunto")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la tarea a la que pertenece el archivo adjunto.
    /// </summary>
    [Column("tareaId")]
    [Description("Identificador de la tarea a la que pertenece el archivo adjunto")]
    public int? TareaId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del comentario al que pertenece el archivo adjunto.
    /// </summary>
    [Column("comentarioId")]
    [Description("Identificador del comentario al que pertenece el archivo adjunto")]
    public int? ComentarioId { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del archivo adjunto.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("archivoAdjuntoNombre")]
    [Description("Nombre del archivo adjunto")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la ruta de almacenamiento del archivo adjunto.
    /// </summary>
    [Required]
    [MaxLength(500)]
    [Column("archivoAdjuntoRutaAlmacenamiento")]
    [Description("Ruta de almacenamiento del archivo adjunto")]
    public string RutaAlmacenamiento { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la extensión del archivo adjunto.
    /// </summary>
    [MaxLength(10)]
    [Column("archivoAdjuntoExtension")]
    [Description("Extensión del archivo adjunto")]
    public string? Extension { get; set; }

    /// <summary>
    /// Obtiene o establece el tamaño en bytes del archivo adjunto.
    /// </summary>
    [Column("archivoAdjuntoTamano")]
    [Description("Tamaño en bytes del archivo adjunto")]
    public long? Tamano { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de subida del archivo adjunto.
    /// </summary>
    [Required]
    [Column("archivoAdjuntoFechaSubida")]
    [Description("Fecha de subida del archivo adjunto")]
    public DateTime FechaSubida { get; set; } = DateTime.Now;

    /// <summary>
    /// Obtiene o establece el identificador del usuario que subió el archivo adjunto.
    /// </summary>
    [Required]
    [Column("subidoPorId")]
    [Description("Identificador del usuario que subió el archivo adjunto")]
    public int SubidoPorId { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el archivo adjunto está activo.
    /// </summary>
    [Required]
    [Column("archivoAdjuntoActivo")]
    [Description("Indica si el archivo adjunto está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación a la tarea.
    /// </summary>
    [ForeignKey(nameof(TareaId))]
    public virtual Tarea? Tarea { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al comentario.
    /// </summary>
    [ForeignKey(nameof(ComentarioId))]
    public virtual ComentarioTarea? Comentario { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario que subió el archivo adjunto.
    /// </summary>
    [ForeignKey(nameof(SubidoPorId))]
    public virtual Usuario? SubidoPor { get; set; }
}