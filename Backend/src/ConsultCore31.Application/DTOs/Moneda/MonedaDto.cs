using ConsultCore31.Application.DTOs.Common;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Moneda
{
    /// <summary>
    /// DTO para representar una moneda en respuestas de la API
    /// </summary>
    public class MonedaDto : BaseDto<int>
    {
        /// <summary>
        /// Código ISO de la moneda
        /// </summary>
        [Required]
        public string Codigo { get; set; } = string.Empty;

        /// <summary>
        /// Nombre de la moneda
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Símbolo de la moneda
        /// </summary>
        public string? Simbolo { get; set; }

        /// <summary>
        /// Tasa de cambio respecto a la moneda base del sistema
        /// </summary>
        public decimal TasaCambio { get; set; }

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
        public bool Activa { get; set; }
    }
}
