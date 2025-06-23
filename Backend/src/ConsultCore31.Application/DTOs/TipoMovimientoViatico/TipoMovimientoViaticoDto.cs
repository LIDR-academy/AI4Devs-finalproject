using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.TipoMovimientoViatico
{
    /// <summary>
    /// DTO para representar un tipo de movimiento de viático en respuestas de la API
    /// </summary>
    public class TipoMovimientoViaticoDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del tipo de movimiento de viático
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del tipo de movimiento de viático
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Tipo de afectación del movimiento (1: Positivo, -1: Negativo)
        /// </summary>
        public int Afectacion { get; set; }

        /// <summary>
        /// Indica si el tipo de movimiento de viático requiere comprobante
        /// </summary>
        public bool RequiereComprobante { get; set; }

        /// <summary>
        /// Indica si el tipo de movimiento de viático está activo
        /// </summary>
        public bool Activo { get; set; }
    }
}