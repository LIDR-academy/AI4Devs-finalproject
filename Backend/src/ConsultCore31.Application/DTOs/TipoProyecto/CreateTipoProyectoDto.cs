using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ConsultCore31.Application.DTOs.TipoProyecto
{
    /// <summary>
    /// DTO para crear un nuevo tipo de proyecto
    /// </summary>
    public class CreateTipoProyectoDto : CreateBaseDto
    {
        /// <summary>
        /// Nombre del tipo de proyecto
        /// </summary>
        [Required(ErrorMessage = "El nombre del tipo de proyecto es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        [JsonPropertyName("tipoProyectoNombre")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del tipo de proyecto
        /// </summary>
        [StringLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        [JsonPropertyName("tipoProyectoDescripcion")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Indica si el tipo de proyecto está activo
        /// </summary>
        [JsonPropertyName("tipoProyectoActivo")]
        public bool Activo { get; set; } = true;
    }
}