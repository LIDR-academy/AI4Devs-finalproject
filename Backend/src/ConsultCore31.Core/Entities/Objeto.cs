using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un objeto en el sistema con sus propiedades básicas.
/// </summary>
[Table("Objetos", Schema = "dbo")]
public class Objeto : BaseEntity<int>
{
    /// <summary>
    /// Obtiene o establece el identificador único del objeto.
    /// </summary>
    [Key]
    [Column("objetoId")]
    [Description("Identificador único del objeto")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece el nombre del objeto.
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("objetoNombre")]
    [Description("Nombre del objeto")]
    public string ObjetoNombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el identificador del tipo de objeto.
    /// </summary>
    [Required]
    [Column("objetoTipoId")]
    [Description("Identificador del tipo de objeto")]
    public int ObjetoTipoId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del menú al que pertenece el objeto.
    /// </summary>
    [Column("menuId")]
    [Description("Identificador del menú")]
    public int? MenuId { get; set; }

    /// <summary>
    /// Obtiene o establece un valor que indica si el objeto está activo.
    /// </summary>
    [Required]
    [Column("objetoActivo")]
    [Description("Indica si el objeto está activo")]
    public bool ObjetoActivo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la navegación al tipo de objeto relacionado.
    /// </summary>
    [ForeignKey(nameof(ObjetoTipoId))]
    [InverseProperty(nameof(ObjetoTipo.Objetos))]
    public virtual ObjetoTipo ObjetoTipo { get; set; } = null!;

    private readonly List<Acceso> _accesos = new List<Acceso>();
    private Menu? _menu;
    private readonly List<Usuario> _usuarios = new List<Usuario>();

    /// <summary>
    /// Obtiene la colección de solo lectura de accesos asociados a este objeto.
    /// </summary>
    public virtual IReadOnlyCollection<Acceso> Accesos => _accesos.AsReadOnly();

    /// <summary>
    /// Obtiene la colección de usuarios asociados a este objeto.
    /// </summary>
    public virtual IReadOnlyCollection<Usuario> Usuarios => _usuarios.AsReadOnly();

    /// <summary>
    /// Obtiene o establece la navegación al menú relacionado.
    /// </summary>
    [ForeignKey("MenuId")]
    public virtual Menu? Menu
    {
        get => _menu;
        set => _menu = value;
    }

    /// <summary>
    /// Agrega un acceso a la colección de accesos de este objeto.
    /// </summary>
    /// <param name="acceso">El acceso a agregar.</param>
    public void AgregarAcceso(Acceso acceso)
    {
        if (acceso == null) throw new ArgumentNullException(nameof(acceso));
        if (!_accesos.Any(a => a.PerfilId == acceso.PerfilId && a.ObjetoId == acceso.ObjetoId))
        {
            _accesos.Add(acceso);
        }
    }
}
