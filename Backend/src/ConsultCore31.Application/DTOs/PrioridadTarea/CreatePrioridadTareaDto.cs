using ConsultCore31.Application.DTOs.Common;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.PrioridadTarea
{
    /// <summary>
    /// DTO para crear una nueva prioridad de tarea
    /// </summary>
    public class CreatePrioridadTareaDto : CreateBaseDto
    {
        /// <summary>
        /// Nombre de la prioridad de tarea
        /// </summary>
        [Required(ErrorMessage = "El nombre de la prioridad de tarea es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción de la prioridad de tarea
        /// </summary>
        [StringLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Color asociado a la prioridad de tarea (en formato hexadecimal)
        /// </summary>
        [StringLength(7, ErrorMessage = "El color debe estar en formato hexadecimal (ej: #FFFFFF) y no exceder 7 caracteres")]
        [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "El color debe estar en formato hexadecimal válido (ej: #FFFFFF)")]
        public string? Color { get; set; }

        /// <summary>
        /// Nivel numérico de la prioridad (mayor número indica mayor prioridad)
        /// </summary>
        [Range(1, 100, ErrorMessage = "El nivel debe estar entre 1 y 100")]
        public int Nivel { get; set; }

        /// <summary>
        /// Indica si la prioridad de tarea está activa
        /// </summary>
        public bool Activa { get; set; } = true;
    }
}
