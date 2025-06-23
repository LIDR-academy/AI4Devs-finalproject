using System;
using System.Collections.Generic;

namespace ConsultCore31.WebAPI.DTOs.Common
{
    /// <summary>
    /// Respuesta estándar para errores de la API
    /// </summary>
    public class ErrorResponse
    {
        /// <summary>
        /// Mensaje principal del error
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Detalles adicionales del error (opcional)
        /// </summary>
        public string Details { get; set; }

        /// <summary>
        /// Referencia única para rastrear el error en logs (opcional)
        /// </summary>
        public string Reference { get; set; }

        /// <summary>
        /// Errores de validación específicos por campo (opcional)
        /// </summary>
        public Dictionary<string, string[]> Errors { get; set; }
    }
}
