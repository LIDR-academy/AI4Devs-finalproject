using ConsultCore31.Core.Common;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un perfil de usuario en el sistema.
/// </summary>
[Table("Perfiles", Schema = "dbo")]
public class Perfil : BaseEntity<int>
{
    private readonly List<Acceso> _accesos = new List<Acceso>();

    private readonly List<Usuario> _usuarios = new List<Usuario>();

    /// <summary>
    /// Obtiene la colección de accesos asociados a este perfil.
    /// </summary>
    public virtual IReadOnlyCollection<Acceso> Accesos => _accesos.AsReadOnly();

    /// <summary>
    /// Obtiene o establece la fecha de creación del perfil.
    /// </summary>
    [Column("fechaCreacion")]
    [Description("Fecha de creación del perfil")]
    public DateTime? FechaCreacion { get; set; }

    /// <summary>
    /// Obtiene o establece la fecha de modificación del perfil.
    /// </summary>
    [Column("fechaModificacion")]
    [Description("Fecha de última modificación del perfil")]
    public DateTime? FechaModificacion { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador único del perfil.
    /// </summary>
    [Key]
    [Column("perfilId")]
    [Description("Identificador único del perfil")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public new int Id { get; set; }

    /// <summary>
    /// Obtiene o establece la navegación al objeto asociado.
    /// </summary>
    [ForeignKey("ObjetoId")]
    public virtual Objeto? Objeto { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del objeto asociado al perfil.
    /// </summary>
    [Required]
    [Column("objetoId")]
    [Description("Identificador del objeto asociado")]
    public int ObjetoId { get; set; } = 1;

    /// <summary>
    /// Obtiene o establece un valor que indica si el perfil está activo.
    /// </summary>
    [Required]
    [Column("perfilActivo")]
    [Description("Indica si el perfil está activo")]
    public bool PerfilActivo { get; set; } = true;

    /// <summary>
    /// Obtiene o establece la descripción del perfil.
    /// </summary>
    [Required]
    [MaxLength(500)]
    [Column("perfilDescripcion")]
    [Description("Descripción del perfil")]
    public string PerfilDescripcion { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene o establece el nombre del perfil.
    /// </summary>
    [Required]
    [MaxLength(50)]
    [Column("perfilNombre")]
    [Description("Nombre del perfil")]
    public string PerfilNombre { get; set; } = string.Empty;

    /// <summary>
    /// Obtiene la colección de usuarios asociados a este perfil.
    /// </summary>
    public virtual IReadOnlyCollection<Usuario> Usuarios => _usuarios.AsReadOnly();

    /// <summary>
    /// Método para agregar un acceso al perfil.
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

    /// <summary>
    /// Método para agregar un usuario al perfil.
    /// </summary>
    /// <param name="usuario">El usuario a agregar.</param>
    public void AgregarUsuario(Usuario usuario)
    {
        if (usuario == null) throw new ArgumentNullException(nameof(usuario));
        if (!_usuarios.Any(u => u.Id == usuario.Id))
        {
            _usuarios.Add(usuario);
        }
    }

    // Se han eliminado las referencias a ProfileRole y ProfilePermission
    // ya que se utilizará el sistema de roles y permisos de Identity
}