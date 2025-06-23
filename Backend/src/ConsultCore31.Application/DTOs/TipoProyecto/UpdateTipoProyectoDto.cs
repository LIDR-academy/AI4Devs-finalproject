using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.TipoProyecto
{
    /// <summary>
    /// DTO para actualizar un tipo de proyecto existente
    /// </summary>
    public class UpdateTipoProyectoDto : UpdateBaseDto<int>
    {
        /// <summary>
        /// Nombre del tipo de proyecto
        /// </summary>
        [Required(ErrorMessage = "El nombre del tipo de proyecto es obligatorio")]
        [StringLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del tipo de proyecto
        /// </summary>
        [StringLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Indica si el tipo de proyecto está activo
        /// </summary>
        public bool Activo { get; set; }
    }
}