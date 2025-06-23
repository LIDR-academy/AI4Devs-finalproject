using ConsultCore31.Core.Common;

using System.ComponentModel.DataAnnotations.Schema;

namespace ConsultCore31.Core.Entities
{
    /// <summary>
    /// Entidad que representa un menú en el sistema.
    /// </summary>
    [Table("Menus", Schema = "dbo")]
    public class Menu : BaseEntity<int>
    {
        /// <summary>
        /// Descripción del menú
        /// </summary>
        [StringLength(500)]
        [Column("descripcion")]
        public string Descripcion { get; set; }

        /// <summary>
        /// Ícono del menú (clase de Font Awesome o similar)
        /// </summary>
        [StringLength(100)]
        [Column("icono")]
        public string Icono { get; set; }

        [Key]
        [Column("menuId")]  // Asegúrate de que esté mapeado a menuId
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public override int Id { get; set; }

        /// <summary>
        /// Nombre del menú
        /// </summary>
        [Required]
        [StringLength(100)]
        [Column("menuNombre")]
        public string MenuNombre { get; set; }

        /// <summary>
        /// Menú padre
        /// </summary>
        [ForeignKey("MenuPadreId")]
        public virtual Menu MenuPadre { get; set; }

        /// <summary>
        /// ID del menú padre (para submenús)
        /// </summary>
        [Column("menuPadreId")]
        public int? MenuPadreId { get; set; }

        /// <summary>
        /// Objetos asociados a este menú
        /// </summary>
        public virtual ICollection<Objeto> Objetos { get; set; } = new List<Objeto>();

        /// <summary>
        /// Orden de visualización del menú
        /// </summary>
        [Column("orden")]
        public int Orden { get; set; }

        /// <summary>
        /// Ruta del menú
        /// </summary>
        [StringLength(200)]
        [Column("ruta")]
        public string Ruta { get; set; }

        /// <summary>
        /// Submenús
        /// </summary>
        public virtual ICollection<Menu> SubMenus { get; set; } = new List<Menu>();
    }
}