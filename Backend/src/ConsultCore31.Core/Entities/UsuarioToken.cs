// Referencia removida ya que Usuario ahora está en el espacio de nombres ConsultCore31.Core.Entities
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using ConsultCore31.Core.Common;

namespace ConsultCore31.Core.Entities
{
    /// <summary>
    /// Entidad que representa un token de usuario en el sistema.
    /// </summary>
    [Table("UsuarioTokens", Schema = "dbo")]
    public class UsuarioToken : BaseEntity<int>
    {
        /// <summary>
        /// Identificador único del token de usuario.
        /// </summary>
        [Key]
        [Column("usuarioTokenId")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public new int Id { get; set; }

        /// <summary>
        /// Indica si el token está activo (no ha sido usado y no ha expirado).
        /// </summary>
        [NotMapped]
        public bool EstaActivo { get; private set; } = false;

        /// <summary>
        /// Indica si el token ha expirado.
        /// </summary>
        [NotMapped]
        public bool EstaExpirado { get; private set; } = false;

        /// <summary>
        /// Fecha de expiración del token.
        /// </summary>
        [Required]
        [Column("usuarioTokenFechaExpiracion")]
        public DateTime FechaExpiracion { get; set; }

        /// <summary>
        /// Token de usuario.
        /// </summary>
        [Required]
        [Column("usuarioToken")]
        public Guid Token { get; set; }

        /// <summary>
        /// Indica si el token ha sido utilizado.
        /// </summary>
        [Required]
        [Column("usuarioTokenUsado")]
        public bool TokenUsado { get; set; } = false;

        /// <summary>
        /// Identificador del usuario asociado al token.
        /// </summary>
        [Required]
        [Column("usuarioId")]
        public int UsuarioId { get; set; }

        /// <summary>
        /// Navegación al usuario.
        /// </summary>
        [ForeignKey("UsuarioId")]
        public virtual Usuario? User { get; set; }

        /// <summary>
        /// Identificador único del JWT (JSON Web Token).
        /// </summary>
        [Required]
        [Column("usuarioJwtId")]
        public Guid UsuarioJwtId { get; set; }

        /// <summary>
        /// Dirección IP desde la que se utilizó el token.
        /// </summary>
        [Column("usuarioTokenIpUso")]
        [MaxLength(50)]
        public string? IpUso { get; set; }

        /// <summary>
        /// Motivo por el cual se utilizó el token.
        /// </summary>
        [Column("usuarioTokenMotivoUso")]
        [MaxLength(250)]
        public string? MotivoUso { get; set; }

        /// <summary>
        /// Fecha en que se utilizó el token.
        /// </summary>
        [Column("usuarioTokenFechaUso")]
        public DateTime? FechaUso { get; set; }
    }
}