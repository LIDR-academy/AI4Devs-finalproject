using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un contacto de un cliente en el sistema.
/// </summary>
[Table("ContactosCliente", Schema = "dbo")]
public class ContactoCliente : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del contacto.
    /// </summary>
    [Key]
    [Column("contactoId")]
    [Description("Identificador único del contacto")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del cliente al que pertenece el contacto.
    /// </summary>
    [Required]
    [Column("clienteId")]
    [Description("Identificador del cliente al que pertenece el contacto")]
    public int ClienteId { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del contacto.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("contactoNombre")]
    [Description("Nombre del contacto")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece los apellidos del contacto.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("contactoApellidos")]
    [Description("Apellidos del contacto")]
    public string Apellidos { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el puesto del contacto en la empresa.
    /// </summary>
    [MaxLength(100)]
    [Column("contactoPuesto")]
    [Description("Puesto del contacto en la empresa")]
    public string? Puesto { get; set; }

    /// <summary>
    /// Obtiene o establece el correo electrónico del contacto.
    /// </summary>
    [MaxLength(100)]
    [Column("contactoEmail")]
    [Description("Correo electrónico del contacto")]
    public string? Email { get; set; }

    /// <summary>
    /// Obtiene o establece el teléfono del contacto.
    /// </summary>
    [MaxLength(15)]
    [Column("contactoTelefono")]
    [Description("Teléfono del contacto")]
    public string? Telefono { get; set; }

    /// <summary>
    /// Obtiene o establece el teléfono móvil del contacto.
    /// </summary>
    [MaxLength(15)]
    [Column("contactoMovil")]
    [Description("Teléfono móvil del contacto")]
    public string? Movil { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el contacto es el principal.
    /// </summary>
    [Required]
    [Column("contactoEsPrincipal")]
    [Description("Indica si el contacto es el principal")]
    public bool EsPrincipal { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el contacto está activo.
    /// </summary>
    [Required]
    [Column("contactoActivo")]
    [Description("Indica si el contacto está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al cliente.
    /// </summary>
    [ForeignKey(nameof(ClienteId))]
    public virtual Cliente? Cliente { get; set; }
}