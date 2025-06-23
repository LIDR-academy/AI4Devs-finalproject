using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.FrecuenciaMedicion
{
    /// <summary>
    /// DTO para representar una frecuencia de medición en respuestas de la API
    /// </summary>
    public class FrecuenciaMedicionDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre de la frecuencia de medición
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción de la frecuencia de medición
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Intervalo en días que representa esta frecuencia de medición
        /// </summary>
        public int IntervaloDias { get; set; }

        /// <summary>
        /// Indica si la frecuencia de medición está activa
        /// </summary>
        public bool Activa { get; set; }
    }
}