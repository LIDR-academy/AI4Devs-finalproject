using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.FrecuenciaMedicion
{
    /// <summary>
    /// DTO para actualizar una frecuencia de medición existente
    /// </summary>
    public class UpdateFrecuenciaMedicionDto : UpdateBaseDto<int>
    {
        /// <summary>
        /// Nombre de la frecuencia de medición
        /// </summary>
        [Required(ErrorMessage = "El nombre de la frecuencia de medición es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción de la frecuencia de medición
        /// </summary>
        [StringLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Intervalo en días que representa esta frecuencia de medición
        /// </summary>
        [Required(ErrorMessage = "El intervalo en días es obligatorio")]
        [Range(1, 365, ErrorMessage = "El intervalo debe estar entre 1 y 365 días")]
        public int IntervaloDias { get; set; }

        /// <summary>
        /// Indica si la frecuencia de medición está activa
        /// </summary>
        public bool Activa { get; set; }
    }
}