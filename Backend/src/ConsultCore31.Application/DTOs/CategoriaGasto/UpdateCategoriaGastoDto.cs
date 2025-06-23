using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.CategoriaGasto
{
    /// <summary>
    /// DTO para actualizar una categoría de gasto
    /// </summary>
    public class UpdateCategoriaGastoDto : UpdateBaseDto<int>
    {
        /// <summary>
        /// Nombre de la categoría de gasto
        /// </summary>
        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(50, ErrorMessage = "El nombre no puede exceder los 50 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción de la categoría de gasto
        /// </summary>
        [MaxLength(200, ErrorMessage = "La descripción no puede exceder los 200 caracteres")]
        public string Descripcion { get; set; } = string.Empty;

        /// <summary>
        /// Indica si la categoría de gasto es estándar del sistema
        /// </summary>
        public bool EsEstandar { get; set; }

        /// <summary>
        /// Indica si la categoría de gasto requiere comprobante
        /// </summary>
        public bool RequiereComprobante { get; set; }

        /// <summary>
        /// Límite máximo permitido para esta categoría de gasto
        /// </summary>
        [Range(0, double.MaxValue, ErrorMessage = "El límite máximo debe ser un valor positivo")]
        public decimal? LimiteMaximo { get; set; }

        /// <summary>
        /// Indica si la categoría de gasto está activa
        /// </summary>
        public bool Activa { get; set; }
    }
}