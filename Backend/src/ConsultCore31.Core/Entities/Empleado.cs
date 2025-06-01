using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ConsultCore31.Core.Common;

namespace ConsultCore31.Core.Entities
{
    /// <summary>
    /// Representa un empleado en el sistema.
    /// </summary>
    [Table("Empleados", Schema = "dbo")]
    public class Empleado : BaseEntity<int>
    {
        /// <summary>
        /// Obtiene o establece el identificador único del empleado.
        /// </summary>
        [Key]
        [Column("empleadoId")]
        [Description("Identificador único del empleado")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public new int Id { get; set; }

        /// <summary>
        /// Obtiene o establece el nombre del empleado.
        /// </summary>
        [Required]
        [MaxLength(150)]
        [Column("empleadoNombre")]
        [Description("Nombre del empleado")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Obtiene o establece los apellidos del empleado.
        /// </summary>
        [Required]
        [MaxLength(300)]
        [Column("empleadoApellidos")]
        [Description("Apellidos del empleado")]
        public string Apellidos { get; set; } = string.Empty;

        /// <summary>
        /// Obtiene o establece la fecha de nacimiento del empleado.
        /// </summary>
        [Column("empleadoFechaNacimiento")]
        [Description("Fecha de nacimiento")]
        public DateTime? FechaNacimiento { get; set; }

        /// <summary>
        /// Obtiene o establece el correo electrónico del empleado.
        /// </summary>
        [Required]
        [MaxLength(150)]
        [Column("empleadoEmail")]
        [Description("Correo electrónico")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Obtiene o establece el teléfono del empleado.
        /// </summary>
        [Required]
        [MaxLength(15)]
        [Column("empleadoTelefono")]
        [Description("Teléfono")]
        public string Telefono { get; set; } = string.Empty;

        /// <summary>
        /// Obtiene o establece el número de móvil del empleado.
        /// </summary>
        [Required]
        [MaxLength(15)]
        [Column("empleadoMovil")]
        [Description("Móvil")]
        public string Movil { get; set; } = string.Empty;

        /// <summary>
        /// Obtiene o establece el identificador del puesto del empleado.
        /// </summary>
        [Column("puestoId")]
        [Description("Puesto")]
        public int? PuestoId { get; set; }

        /// <summary>
        /// Obtiene o establece un valor que indica si el empleado está activo.
        /// </summary>
        [Required]
        [Column("empleadoActivo")]
        [Description("Activo")]
        public bool Activo { get; set; } = false;

        /// <summary>
        /// Obtiene o establece el identificador del objeto asociado al empleado.
        /// </summary>
        [Required]
        [Column("objetoId")]
        [Description("Objeto")]
        public int ObjetoId { get; set; } = 6; // Valor por defecto según la definición de la tabla

        /// <summary>
        /// Obtiene o establece el género del empleado.
        /// </summary>
        [Required]
        [Column("empleadoGenero")]
        [Description("Género")]
        public int Genero { get; set; } = 0;

        /// <summary>
        /// Obtiene o establece la fecha de ingreso del empleado.
        /// </summary>
        [Column("empleadoFechaIngreso")]
        [Description("Fecha de ingreso")]
        public DateTime? FechaIngreso { get; set; }

        /// <summary>
        /// Obtiene o establece un valor que indica si el empleado tiene licencia de conducir.
        /// </summary>
        [Required]
        [Column("empleadoLicencia")]
        [Description("Licencia de conducir")]
        public bool TieneLicencia { get; set; } = false;

        // Propiedades de navegación
        
        /// <summary>
        /// Obtiene o establece el puesto del empleado.
        /// </summary>
        [ForeignKey("PuestoId")]
        public virtual Puesto? Puesto { get; set; }

        /// <summary>
        /// Obtiene o establece el objeto asociado al empleado.
        /// </summary>
        [ForeignKey("ObjetoId")]
        public virtual Objeto Objeto { get; set; } = null!;

        /// <summary>
        /// Obtiene o establece la relación con el usuario asociado a este empleado.
        /// </summary>
        public virtual Usuario? Usuario { get; set; }
    }
}
