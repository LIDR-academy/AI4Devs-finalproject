using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;

namespace ConsultCore31.Core.Entities
{
    /// <summary>
    /// Representa un puesto de trabajo en la organización.
    /// </summary>
    [Table("Puestos", Schema = "dbo")]
    public class Puesto : BaseEntity<int>
    {
        /// <summary>
        /// Obtiene o establece el identificador único del puesto.
        /// </summary>
        [Key]
        [Column("puestoId")]
        [Description("Identificador único del puesto")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public new int Id { get; set; }

        /// <summary>
        /// Obtiene o establece el nombre del puesto.
        /// </summary>
        [Required]
        [MaxLength(100)]
        [Column("puestoNombre")]
        [Description("Nombre del puesto")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Obtiene o establece la descripción del puesto.
        /// </summary>
        [MaxLength(500)]
        [Column("puestoDescripcion")]
        [Description("Descripción del puesto")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Obtiene o establece un valor que indica si el puesto está activo.
        /// </summary>
        [Required]
        [Column("puestoActivo")]
        [Description("Indica si el puesto está activo")]
        public bool Activo { get; set; } = true;

        /// <summary>
        /// Obtiene o establece la colección de empleados que ocupan este puesto.
        /// </summary>
        public virtual ICollection<Empleado> Empleados { get; set; } = new List<Empleado>();
    }
}
