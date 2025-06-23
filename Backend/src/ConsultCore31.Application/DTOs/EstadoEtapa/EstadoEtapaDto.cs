using ConsultCore31.Application.DTOs.Common;

using System.ComponentModel.DataAnnotations;

namespace ConsultCore31.Application.DTOs.EstadoEtapa
{
    /// <summary>
    /// DTO para representar un estado de etapa en respuestas de la API
    /// </summary>
    public class EstadoEtapaDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre del estado de la etapa
        /// </summary>
        [Required]
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción del estado de la etapa
        /// </summary>
        public string? Descripcion { get; set; }

        /// <summary>
        /// Color asociado al estado de la etapa (en formato hexadecimal)
        /// </summary>
        public string? Color { get; set; }

        /// <summary>
        /// Orden de visualización del estado de la etapa
        /// </summary>
        public int Orden { get; set; }

        /// <summary>
        /// Indica si el estado de la etapa representa un estado final
        /// </summary>
        public bool EsEstadoFinal { get; set; }

        /// <summary>
        /// Indica si el estado de la etapa está activo
        /// </summary>
        public bool Activo { get; set; }
    }
}