using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.TipoMovimientoViatico
{
    /// <summary>
    /// DTO para crear un nuevo tipo de movimiento de viático
    /// </summary>
    public class CreateTipoMovimientoViaticoDto : CreateBaseDto
    {
        /// <summary>
        /// Nombre del tipo de movimiento de viático
        /// </summary>
        [Required(ErrorMessage = "El nombre del tipo de movimiento de viático es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del tipo de movimiento de viático
        /// </summary>
        [StringLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Tipo de afectación del movimiento (1: Positivo, -1: Negativo)
        /// </summary>
        [Required(ErrorMessage = "La afectación del movimiento es obligatoria")]
        [Range(-1, 1, ErrorMessage = "La afectación debe ser 1 (positivo) o -1 (negativo)")]
        public int Afectacion { get; set; } = 1;

        /// <summary>
        /// Indica si el tipo de movimiento de viático requiere comprobante
        /// </summary>
        public bool RequiereComprobante { get; set; } = true;

        /// <summary>
        /// Indica si el tipo de movimiento de viático está activo
        /// </summary>
        public bool Activo { get; set; } = true;
    }
}