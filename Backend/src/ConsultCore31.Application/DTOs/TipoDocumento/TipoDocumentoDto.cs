using ConsultCore31.Application.DTOs.Common;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.TipoDocumento
{
    /// <summary>
    /// DTO para representar un tipo de documento en respuestas de la API
    /// </summary>
    public class TipoDocumentoDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del tipo de documento
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del tipo de documento
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Extensiones de archivo permitidas para este tipo de documento (separadas por comas)
        /// </summary>
        public string? ExtensionesPermitidas { get; set; }

        /// <summary>
        /// Tamaño máximo permitido en megabytes para este tipo de documento
        /// </summary>
        public decimal? TamanoMaximoMB { get; set; }

        /// <summary>
        /// Indica si el tipo de documento está activo
        /// </summary>
        public bool Activo { get; set; }
    }
}
