using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Moneda
{
    /// <summary>
    /// DTO para crear una nueva moneda
    /// </summary>
    public class CreateMonedaDto : CreateBaseDto
    {
        /// <summary>
        /// Código ISO de la moneda
        /// </summary>
        [Required(ErrorMessage = "El código ISO de la moneda es obligatorio")]
        [StringLength(3, MinimumLength = 3, ErrorMessage = "El código ISO debe tener exactamente 3 caracteres")]
        [RegularExpression(@"^[A-Z]{3}$", ErrorMessage = "El código ISO debe contener 3 letras mayúsculas")]
        public string Codigo { get; set; } = string.Empty;

        /// <summary>
        /// Nombre de la moneda
        /// </summary>
        [Required(ErrorMessage = "El nombre de la moneda es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Símbolo de la moneda
        /// </summary>
        [StringLength(5, ErrorMessage = "El símbolo no puede exceder los 5 caracteres")]
        public string? Simbolo { get; set; }

        /// <summary>
        /// Tasa de cambio respecto a la moneda base del sistema
        /// </summary>
        [Required(ErrorMessage = "La tasa de cambio es obligatoria")]
        [Range(0.000001, 9999999, ErrorMessage = "La tasa de cambio debe ser un valor positivo")]
        public decimal TasaCambio { get; set; } = 1;

        /// <summary>
        /// Fecha de actualización de la tasa de cambio
        /// </summary>
        public DateTime? FechaActualizacion { get; set; }

        /// <summary>
        /// Indica si es la moneda predeterminada del sistema
        /// </summary>
        public bool EsPredeterminada { get; set; }

        /// <summary>
        /// Indica si la moneda está activa
        /// </summary>
        public bool Activa { get; set; } = true;
    }
}