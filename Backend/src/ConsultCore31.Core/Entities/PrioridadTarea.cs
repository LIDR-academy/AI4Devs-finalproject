using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa los niveles de prioridad para las tareas en el sistema.
/// </summary>
[Table("PrioridadesTarea", Schema = "dbo")]
public class PrioridadTarea : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único de la prioridad de tarea.
    /// </summary>
    [Key]
    [Column("prioridadTareaId")]
    [Description("Identificador único de la prioridad de tarea")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre de la prioridad de tarea.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("prioridadTareaNombre")]
    [Description("Nombre de la prioridad de tarea")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece la descripción de la prioridad de tarea.
    /// </summary>
    [MaxLength(200)]
    [Column("prioridadTareaDescripcion")]
    [Description("Descripción de la prioridad de tarea")]
    public string? Descripcion { get; set; }

    /// <summary>
    /// Obtiene o establece el color asociado a la prioridad de tarea (en formato hexadecimal).
    /// </summary>
    [MaxLength(7)]
    [Column("prioridadTareaColor")]
    [Description("Color asociado a la prioridad de tarea")]
    public string? Color { get; set; }

    /// <summary>
    /// Obtiene o establece el nivel numérico de la prioridad (mayor número indica mayor prioridad).
    /// </summary>
    [Required]
    [Column("prioridadTareaNivel")]
    [Description("Nivel numérico de la prioridad")]
    public int Nivel { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si la prioridad de tarea está activa.
    /// </summary>
    [Required]
    [Column("prioridadTareaActiva")]
    [Description("Indica si la prioridad de tarea está activa")]
    public bool Activa { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la colección de tareas que tienen esta prioridad.
    /// </summary>
    public virtual ICollection<Tarea>? Tareas { get; set; }
}