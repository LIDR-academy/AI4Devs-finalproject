using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;

namespace ConsultCore31.Core.Entities
{
    /// <summary>
    /// Entidad que representa la relación entre perfiles y objetos en el sistema de control de accesos.
    /// </summary>
    [Table("Accesos", Schema = "dbo")]
    public class Acceso : BaseEntity<int>
    {
        /// <summary>
        /// Identificador del perfil asociado al acceso.
        /// </summary>
        [Key, Column("perfilId", Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int PerfilId { get; set; }

        /// <summary>
        /// Identificador del objeto asociado al acceso.
        /// </summary>
        [Key, Column("objetoId", Order = 1)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ObjetoId { get; set; }

        /// <summary>
        /// Indica si el acceso está activo.
        /// </summary>
        [Required]
        [Column("accesoActivo")]
        public bool Activo { get; set; } = false;

        // Propiedades de navegación
        
        /// <summary>
        /// Perfil asociado al acceso.
        /// </summary>
        [ForeignKey("PerfilId")]
        public virtual Perfil Perfil { get; set; }

        /// <summary>
        /// Objeto asociado al acceso.
        /// </summary>
        [ForeignKey("ObjetoId")]
        public virtual Objeto Objeto { get; set; }
    }
}
