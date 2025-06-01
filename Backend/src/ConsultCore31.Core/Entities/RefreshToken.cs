using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;
using ConsultCore31.Core.Entities;

namespace ConsultCore31.Core.Entities.Seguridad
{
    /// <summary>
    /// Entidad que representa un token de actualización (refresh token) en el sistema.
    /// </summary>
    /// <summary>
    /// Representa un token de actualización utilizado para renovar los tokens de autenticación.
    /// </summary>
    [Table("RefreshTokens", Schema = "dbo")]
    public class RefreshToken : BaseEntity<int>
    {
        /// <summary>
        /// Identificador único del token de actualización.
        /// </summary>
        [Key]
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public new int Id { get; set; }
        /// <summary>
        /// Inicializa una nueva instancia de la clase <see cref="RefreshToken"/>.
        /// </summary>
        public RefreshToken()
        {
            Token = string.Empty;
            CreadoPorIp = string.Empty;
            RazonRevocacion = string.Empty;
            ReemplazadoPorToken = string.Empty;
        }

        /// <summary>
        /// Obtiene o establece la dirección IP desde la que se creó el token.
        /// </summary>
        [Required]
        [StringLength(50)]
        [Column("creado_por_ip")]
        public string CreadoPorIp { get; set; }

        /// <summary>
        /// Obtiene o establece la fecha y hora de expiración del token.
        /// </summary>
        [Required]
        [Column("fecha_expiracion")]
        public DateTime FechaExpiracion { get; set; }

        /// <summary>
        /// Obtiene o establece la fecha y hora en que el token fue revocado.
        /// </summary>
        [Column("fecha_revocacion")]
        public DateTime? FechaRevocacion { get; set; }

        /// <summary>
        /// Obtiene o establece la razón por la que se revocó el token.
        /// </summary>
        [StringLength(250)]
        [Column("razon_revocacion")]
        public string RazonRevocacion { get; set; }

        /// <summary>
        /// Obtiene o establece el token que reemplaza a este token cuando se renueva.
        /// </summary>
        [StringLength(500)]
        [Column("reemplazado_por_token")]
        public string ReemplazadoPorToken { get; set; }

        /// <summary>
        /// Obtiene o establece un valor que indica si el token ha sido revocado.
        /// </summary>
        [Required]
        [Column("revocado")]
        public bool Revocado { get; set; } = false;

        /// <summary>
        /// Obtiene o establece el valor del token de actualización.
        /// </summary>
        [Required]
        [StringLength(500)]
        [Column("token")]
        public string Token { get; set; }

        /// <summary>
        /// Obtiene o establece el identificador del usuario asociado al token.
        /// </summary>
        [Required]
        [Column("usuario_id")]
        public int UsuarioId { get; set; }

        /// <summary>
        /// Obtiene o establece el usuario asociado al token.
        /// </summary>
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }
    }
}