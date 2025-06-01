using System;
using System.ComponentModel.DataAnnotations;
using ConsultCore31.Application.DTOs.Common;

namespace ConsultCore31.Application.DTOs.CategoriaGasto
{
    /// <summary>
    /// DTO para representar una categoría de gasto
    /// </summary>
    public class CategoriaGastoDto : BaseDto<int>
    {
        /// <summary>
        /// Nombre de la categoría de gasto
        /// </summary>
        public string Nombre { get; set; } = string.Empty;

        /// <summary>
        /// Descripción de la categoría de gasto
        /// </summary>
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
        public decimal? LimiteMaximo { get; set; }

        /// <summary>
        /// Indica si la categoría de gasto está activa
        /// </summary>
        public bool Activa { get; set; }


    }
}
