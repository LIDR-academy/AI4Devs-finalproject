using ConsultCore31.Application.DTOs.Common;

namespace ConsultCore31.Application.DTOs.Empleado
{
    /// <summary>
    /// DTO para representar un empleado en el sistema
    /// </summary>
    public class EmpleadoDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del empleado
        /// </summary>
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Apellidos del empleado
        /// </summary>
        public string Apellidos { get; set; } = string.Empty;

        /// <summary>
        /// Nombre completo del empleado (Nombre + Apellidos)
        /// </summary>
        public string NombreCompleto => $"{Nombre} {Apellidos}";

        /// <summary>
        /// Fecha de nacimiento del empleado
        /// </summary>
        public DateTime? FechaNacimiento { get; set; }

        /// <summary>
        /// Correo electrónico del empleado
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Teléfono del empleado
        /// </summary>
        public string Telefono { get; set; } = string.Empty;

        /// <summary>
        /// Número de móvil del empleado
        /// </summary>
        public string Movil { get; set; } = string.Empty;

        /// <summary>
        /// Identificador del puesto del empleado
        /// </summary>
        public int? PuestoId { get; set; }

        /// <summary>
        /// Nombre del puesto del empleado
        /// </summary>
        public string? NombrePuesto { get; set; }

        /// <summary>
        /// Indica si el empleado está activo
        /// </summary>
        public bool Activo { get; set; }

        /// <summary>
        /// Identificador del objeto asociado al empleado
        /// </summary>
        public int ObjetoId { get; set; }

        /// <summary>
        /// Género del empleado (0: No especificado, 1: Masculino, 2: Femenino, 3: Otro)
        /// </summary>
        public int Genero { get; set; }

        /// <summary>
        /// Fecha de ingreso del empleado
        /// </summary>
        public DateTime? FechaIngreso { get; set; }

        /// <summary>
        /// Indica si el empleado tiene licencia de conducir
        /// </summary>
        public bool TieneLicencia { get; set; }
    }
}