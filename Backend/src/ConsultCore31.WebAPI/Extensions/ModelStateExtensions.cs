using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Collections.Generic;
using System.Linq;

namespace ConsultCore31.WebAPI.Extensions
{
    /// <summary>
    /// Extensiones para el ModelState que facilitan el manejo de errores de validación
    /// </summary>
    public static class ModelStateExtensions
    {
        /// <summary>
        /// Convierte los errores del ModelState a un diccionario para usar en respuestas de error
        /// </summary>
        /// <param name="modelState">ModelState con errores de validación</param>
        /// <returns>Diccionario con los errores organizados por campo</returns>
        public static Dictionary<string, string[]> GetErrorMessages(this ModelStateDictionary modelState)
        {
            return modelState.Where(x => x.Value.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                );
        }
    }
}
