using ConsultCore31.Application.DTOs.Common;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.TipoDocumento
{
    /// <summary>
    /// DTO para crear un nuevo tipo de documento
    /// </summary>
    public class CreateTipoDocumentoDto : CreateBaseDto
    {
        /// <summary>
        /// Nombre del tipo de documento
        /// </summary>
        [Required(ErrorMessage = "El nombre del tipo de documento es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del tipo de documento
        /// </summary>
        [StringLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Extensiones de archivo permitidas para este tipo de documento (separadas por comas)
        /// </summary>
        [StringLength(200, ErrorMessage = "Las extensiones permitidas no pueden exceder los 200 caracteres")]
        public string? ExtensionesPermitidas { get; set; }

        /// <summary>
        /// Tamaño máximo permitido en megabytes para este tipo de documento
        /// </summary>
        [Range(0.1, 1000, ErrorMessage = "El tamaño máximo debe estar entre 0.1 y 1000 MB")]
        public decimal? TamanoMaximoMB { get; set; }

        /// <summary>
        /// Indica si el tipo de documento está activo
        /// </summary>
        public bool Activo { get; set; } = true;
    }
}
