using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa los posibles estados de una tarea en el sistema.
/// </summary>
[Table("EstadosTarea", Schema = "dbo")]
public class EstadoTarea : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del estado de la tarea.
    /// </summary>
    [Key]
    [Column("estadoTareaId")]
    [Description("Identificador único del estado de la tarea")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del estado de la tarea.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("estadoTareaNombre")]
    [Description("Nombre del estado de la tarea")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción del estado de la tarea.
    /// </summary>
    [MaxLength(200)]
    [Column("estadoTareaDescripcion")]
    [Description("Descripción del estado de la tarea")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el color asociado al estado de la tarea (en formato hexadecimal).
    /// </summary>
    [MaxLength(7)]
    [Column("estadoTareaColor")]
    [Description("Color asociado al estado de la tarea")]
    public string? Color { get; set; }

    /// <summary>
    /// Obtiene o establece el orden de visualización del estado de la tarea.
    /// </summary>
    [Required]
    [Column("estadoTareaOrden")]
    [Description("Orden de visualización del estado de la tarea")]
    public int Orden { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el estado de la tarea representa un estado final.
    /// </summary>
    [Required]
    [Column("estadoTareaEsFinal")]
    [Description("Indica si el estado de la tarea representa un estado final")]
    public bool EsEstadoFinal { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el estado de la tarea está activo.
    /// </summary>
    [Required]
    [Column("estadoTareaActivo")]
    [Description("Indica si el estado de la tarea está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de tareas que tienen este estado.
    /// </summary>
    public virtual ICollection<Tarea>? Tareas { get; set; }
}