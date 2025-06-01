using System;
using System.ComponentModel.DataAnnotations;
using ConsultCore31.Application.DTOs.Common;

namespace ConsultCore31.Application.DTOs.Empleado
{
    /// <summary>
    /// DTO para crear un nuevo empleado en el sistema
    /// </summary>
    public class CreateEmpleadoDto : CreateBaseDto
    {
        /// <summary>
        /// Nombre del empleado
        /// </summary>
        [Required(ErrorMessage = "El nombre del empleado es obligatorio")]
        [StringLength(150, ErrorMessage = "El nombre no puede exceder los 150 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Apellidos del empleado
        /// </summary>
        [Required(ErrorMessage = "Los apellidos del empleado son obligatorios")]
        [StringLength(300, ErrorMessage = "Los apellidos no pueden exceder los 300 caracteres")]
        public string Apellidos { get; set; } = string.Empty;

        /// <summary>
        /// Fecha de nacimiento del empleado
        /// </summary>
        public DateTime? FechaNacimiento { get; set; }

        /// <summary>
        /// Correo electrónico del empleado
        /// </summary>
        [Required(ErrorMessage = "El correo electrónico es obligatorio")]
        [StringLength(150, ErrorMessage = "El correo electrónico no puede exceder los 150 caracteres")]
        [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido")]
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Teléfono del empleado
        /// </summary>
        [Required(ErrorMessage = "El teléfono es obligatorio")]
        [StringLength(15, ErrorMessage = "El teléfono no puede exceder los 15 caracteres")]
        [RegularExpression(@"^(\+?\d{1,3}[- ]?)?\d{10}$", ErrorMessage = "El formato del teléfono no es válido")]
        public string Telefono { get; set; } = string.Empty;

        /// <summary>
        /// Número de móvil del empleado
        /// </summary>
        [Required(ErrorMessage = "El número de móvil es obligatorio")]
        [StringLength(15, ErrorMessage = "El número de móvil no puede exceder los 15 caracteres")]
        [RegularExpression(@"^(\+?\d{1,3}[- ]?)?\d{10}$", ErrorMessage = "El formato del número de móvil no es válido")]
        public string Movil { get; set; } = string.Empty;

        /// <summary>
        /// Identificador del puesto del empleado
        /// </summary>
        public int? PuestoId { get; set; }

        /// <summary>
        /// Indica si el empleado está activo
        /// </summary>
        public bool Activo { get; set; } = true;

        /// <summary>
        /// Identificador del objeto asociado al empleado
        /// </summary>
        public int ObjetoId { get; set; } = 6; // Valor por defecto para objeto de tipo Empleado

        /// <summary>
        /// Género del empleado (0: No especificado, 1: Masculino, 2: Femenino, 3: Otro)
        /// </summary>
        [Required(ErrorMessage = "El género es obligatorio")]
        [Range(0, 3, ErrorMessage = "El valor del género debe estar entre 0 y 3")]
        public int Genero { get; set; } = 0;

        /// <summary>
        /// Fecha de ingreso del empleado
        /// </summary>
        public DateTime? FechaIngreso { get; set; } = DateTime.Now;

        /// <summary>
        /// Indica si el empleado tiene licencia de conducir
        /// </summary>
        public bool TieneLicencia { get; set; } = false;
    }
}
