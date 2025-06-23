using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un cliente en el sistema.
/// </summary>
[Table("Clientes", Schema = "dbo")]
public class Cliente : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del cliente.
    /// </summary>
    [Key]
    [Column("clienteId")]
    [Description("Identificador único del cliente")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del cliente.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("clienteNombre")]
    [Description("Nombre del cliente")]
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el nombre comercial del cliente.
    /// </summary>
    [MaxLength(100)]
    [Column("clienteNombreComercial")]
    [Description("Nombre comercial del cliente")]
    public string? NombreComercial { get; set; }

    /// <summary>
    /// Obtiene o establece el RFC del cliente.
    /// </summary>
    [MaxLength(13)]
    [Column("clienteRFC")]
    [Description("RFC del cliente")]
    public string? RFC { get; set; }

    /// <summary>
    /// Obtiene o establece la dirección del cliente.
    /// </summary>
    [MaxLength(200)]
    [Column("clienteDireccion")]
    [Description("Dirección del cliente")]
    public string? Direccion { get; set; }

    /// <summary>
    /// Obtiene o establece el teléfono del cliente.
    /// </summary>
    [MaxLength(15)]
    [Column("clienteTelefono")]
    [Description("Teléfono del cliente")]
    public string? Telefono { get; set; }

    /// <summary>
    /// Obtiene o establece el correo electrónico del cliente.
    /// </summary>
    [MaxLength(100)]
    [Column("clienteEmail")]
    [Description("Correo electrónico del cliente")]
    public string? Email { get; set; }

    /// <summary>
    /// Obtiene o establece el sitio web del cliente.
    /// </summary>
    [MaxLength(100)]
    [Column("clienteSitioWeb")]
    [Description("Sitio web del cliente")]
    public string? SitioWeb { get; set; }

    /// <summary>
    /// Obtiene o establece la industria a la que pertenece el cliente.
    /// </summary>
    [MaxLength(50)]
    [Column("clienteIndustria")]
    [Description("Industria a la que pertenece el cliente")]
    public string? Industria { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de alta del cliente en el sistema.
    /// </summary>
    [Column("clienteFechaAlta")]
    [Description("Fecha de alta del cliente en el sistema")]
    public DateTime FechaAlta { get; set; } = DateTime.Now;

    /// <summary>
    /// Obtiene o establece un valor que indica si el cliente está activo.
    /// </summary>
    [Required]
    [Column("clienteActivo")]
    [Description("Indica si el cliente está activo")]
    public bool Activo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece el identificador del objeto asociado.
    /// </summary>
    [Required]
    [Column("objetoId")]
    [Description("Identificador del objeto asociado")]
    public int ObjetoId { get; set; } = 4; // Valor predeterminado para objeto de tipo Cliente

    /// <summary>
    /// Obtiene o establece la navegación al objeto asociado.
    /// </summary>
    [ForeignKey(nameof(ObjetoId))]
    public virtual Objeto? Objeto { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de proyectos asociados al cliente.
    /// </summary>
    public virtual ICollection<Proyecto>? Proyectos { get; set; }

    /// <summary>
    /// Obtiene o establece la colección de contactos asociados al cliente.
    /// </summary>
    public virtual ICollection<ContactoCliente>? Contactos { get; set; }
}