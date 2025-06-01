using ConsultCore31.Application.DTOs.Common;
using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.Puesto
{
    /// <summary>
    /// DTO para actualizar un puesto existente
    /// </summary>
    public class UpdatePuestoDto : UpdateBaseDto<int>
    {
        /// <summary>
        /// Nombre del puesto
        /// </summary>
        [Required(ErrorMessage = "El nombre del puesto es obligatorio")]
        [StringLength(100, ErrorMessage = "El nombre no puede exceder los 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del puesto
        /// </summary>
        [StringLength(500, ErrorMessage = "La descripción no puede exceder los 500 caracteres")]
        public string? Descripcion { get; set; }

        /// <summary>
        /// Indica si el puesto está activo
        /// </summary>
        public bool Activo { get; set; }
    }
}
