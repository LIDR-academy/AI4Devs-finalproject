using ConsultCore31.Core.Entities.Seguridad;

using Microsoft.AspNetCore.Identity;

using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities;

/// <summary>
/// Representa un usuario del sistema con sus propiedades de autenticación y perfil.
/// </summary>
[Table("Usuarios", Schema = "dbo")]
public class Usuario : IdentityUser<int>
{
    public Usuario()
    {
        // Inicializar propiedades requeridas
        UsuarioApellidos = string.Empty;
        TokenUsuario = Guid.NewGuid();
        UsuarioActivo = true;
        PerfilId = 1;
        ObjetoId = 2;
        RefreshTokens = new List<RefreshToken>();
    }

    #region Propiedades personalizadas

    /// <summary>
    /// Obtiene o establece los apellidos del usuario.
    /// </summary>
    [Required]
    [MaxLength(300)]
    [Column("usuarioApellidos")]
    [Description("Apellidos del usuario")]
    public string UsuarioApellidos { get; set; }

    /// <summary>
    /// Obtiene o establece el token de autenticación del usuario.
    /// </summary>
    [Column("usuarioToken")]
    [Description("Token de autenticación del usuario")]
    public Guid? TokenUsuario { get; set; }

    /// <summary>
    /// Obtiene o establece si el usuario está activo.
    /// </summary>
    [Required]
    [Column("usuarioActivo")]
    [Description("Indica si el usuario está activo")]
    public bool UsuarioActivo { get; set; }

    /// <summary>
    /// Obtiene o establece el token de recuperación de contraseña.
    /// </summary>
    [MaxLength(500)]
    [Column("usuarioContrasenaRecuperacion")]
    [Description("Token de recuperación de contraseña")]
    public string? UsuarioContrasenaRecuperacion { get; set; }

    /// <summary>
    /// Obtiene o establece el ID del perfil del usuario.
    /// </summary>
    [Required]
    [Column("perfilId")]
    [Description("ID del perfil del usuario")]
    public int PerfilId { get; set; }

    /// <summary>
    /// Obtiene o establece el identificador del empleado asociado al usuario.
    /// </summary>
    [Column("empleadoId")]
    [Description("Identificador del empleado asociado")]
    public int? EmpleadoId { get; set; }

    /// <summary>
    /// Obtiene o establece el empleado asociado a este usuario.
    /// </summary>
    [ForeignKey("EmpleadoId")]
    public virtual Empleado? Empleado { get; set; }

    /// <summary>
    /// Obtiene o establece el ID del objeto asociado.
    /// </summary>
    [Required]
    [Column("objetoId")]
    [Description("ID del objeto asociado")]
    public int ObjetoId { get; set; }

    #endregion Propiedades personalizadas

    #region Propiedades de navegación

    [ForeignKey("PerfilId")]
    public virtual Perfil? Perfil { get; set; }

    [ForeignKey("ObjetoId")]
    public virtual Objeto? Objeto { get; set; }

    [InverseProperty("Usuario")]
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; }

    #endregion Propiedades de navegación

    #region Propiedades de Identity mapeadas a columnas personalizadas

    [Column("usuarioId")]
    public override int Id { get; set; }

    [Column("usuarioNombre")]
    [MaxLength(256)]
    public override string? UserName { get; set; }

    [Column("usuarioEmail")]
    [MaxLength(256)]
    public override string? Email { get; set; }

    [Column("usuarioMovil")]
    [MaxLength(15)]
    public override string? PhoneNumber { get; set; }

    [Column("passwordHash")]
    public override string? PasswordHash { get; set; }

    [Column("securityStamp")]
    public override string? SecurityStamp { get; set; }

    [Column("concurrencyStamp")]
    public override string? ConcurrencyStamp { get; set; } = Guid.NewGuid().ToString();

    [Column("lockoutEnd")]
    public override DateTimeOffset? LockoutEnd { get; set; }

    [Column("lockoutEnabled")]
    public override bool LockoutEnabled { get; set; } = true;

    [Column("accessFailedCount")]
    public override int AccessFailedCount { get; set; }

    #endregion Propiedades de Identity mapeadas a columnas personalizadas

    #region Métodos de utilidad

    /// <summary>
    /// Obtiene o establece la contraseña cifrada del usuario.
    /// </summary>
    /// <remarks>
    /// Esta propiedad está marcada como ignorada por Entity Framework.
    /// Utilice los métodos SetPassword y GetPassword para manejar la contraseña de manera segura.
    /// </remarks>
    [NotMapped]
    public IReadOnlyList<byte>? UsuarioContrasena { get; private set; }

    /// <summary>
    /// Almacena la contraseña cifrada en la base de datos.
    /// </summary>
    [Column("usuarioContrasena", TypeName = "varbinary(500)")]
    [Description("Contraseña cifrada del usuario")]
    private byte[]? _usuarioContrasena { get; set; }

    /// <summary>
    /// Establece la contraseña del usuario.
    /// </summary>
    /// <param name="password">La contraseña a establecer.</param>
    public void SetPassword(byte[] password)
    {
        if (password == null) throw new ArgumentNullException(nameof(password));
        _usuarioContrasena = password;
        UsuarioContrasena = new List<byte>(password).AsReadOnly();
    }

    /// <summary>
    /// Obtiene la contraseña del usuario.
    /// </summary>
    /// <returns>La contraseña como un array de bytes.</returns>
    public byte[] GetPassword()
    {
        return _usuarioContrasena ?? Array.Empty<byte>();
    }

    #endregion Métodos de utilidad

    /// <summary>
    /// Obtiene o establece el identificador numérico del usuario.
    /// </summary>
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    [Column("usuarioNumero")]
    [Description("Identificador numérico del usuario")]
    public int UsuarioNumero { get; set; }
}