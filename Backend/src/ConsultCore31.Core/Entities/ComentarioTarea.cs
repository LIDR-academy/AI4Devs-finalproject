using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un comentario en una tarea en el sistema.
/// </summary>
[Table("ComentariosTarea", Schema = "dbo")]
public class ComentarioTarea : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del comentario.
    /// </summary>
    [Key]
    [Column("comentarioId")]
    [Description("Identificador único del comentario")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador de la tarea a la que pertenece el comentario.
    /// </summary>
    [Required]
    [Column("tareaId")]
    [Description("Identificador de la tarea a la que pertenece el comentario")]
    public int TareaId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del usuario que realizó el comentario.
    /// </summary>
    [Required]
    [Column("usuarioId")]
    [Description("Identificador del usuario que realizó el comentario")]
    public int UsuarioId { get; set; }

    /// <summary>
    /// Obtiene o establece el contenido del comentario.
    /// </summary>
    [Required]
    [Column("comentarioContenido")]
    [Description("Contenido del comentario")]
    public string Contenido { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la fecha de creación del comentario.
    /// </summary>
    [Required]
    [Column("comentarioFechaCreacion")]
    [Description("Fecha de creación del comentario")]
    public new DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Obtiene o establece un valor que indica si el comentario tiene archivos adjuntos.
    /// </summary>
    [Required]
    [Column("comentarioTieneArchivosAdjuntos")]
    [Description("Indica si el comentario tiene archivos adjuntos")]
    public bool TieneArchivosAdjuntos { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el comentario está activo.
    /// </summary>
    [Required]
    [Column("comentarioActivo")]
    [Description("Indica si el comentario está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación a la tarea.
    /// </summary>
    [ForeignKey(nameof(TareaId))]
    public virtual Tarea? Tarea { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al usuario.
    /// </summary>
    [ForeignKey(nameof(UsuarioId))]
    public virtual Usuario? Usuario { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de archivos adjuntos del comentario.
    /// </summary>
    public virtual ICollection<ArchivoAdjunto>? ArchivosAdjuntos { get; set; }
}