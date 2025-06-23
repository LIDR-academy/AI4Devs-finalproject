using System.Security.Claims;

namespace ConsultCore31.WebAPI.Extensions
{
    /// <summary>
    /// Extensiones para la clase ClaimsPrincipal
    /// </summary>
    public static class ClaimsPrincipalExtensions
    {
        /// <summary>
        /// Obtiene el ID del usuario desde las claims
        /// </summary>
        /// <param name="principal">ClaimsPrincipal del usuario autenticado</param>
        /// <returns>ID del usuario o null si no se encuentra</returns>
        public static string GetUserId(this ClaimsPrincipal principal)
        {
            if (principal == null)
                return null;

            // Intentar obtener el ID del usuario desde la claim NameIdentifier
            var claim = principal.FindFirst(ClaimTypes.NameIdentifier);
            return claim?.Value;
        }

        /// <summary>
        /// Obtiene el nombre de usuario desde las claims
        /// </summary>
        /// <param name="principal">ClaimsPrincipal del usuario autenticado</param>
        /// <returns>Nombre de usuario o null si no se encuentra</returns>
        public static string GetUserName(this ClaimsPrincipal principal)
        {
            if (principal == null)
                return null;

            // Intentar obtener el nombre de usuario desde la claim Name
            var claim = principal.FindFirst(ClaimTypes.Name);
            return claim?.Value;
        }

        /// <summary>
        /// Obtiene el correo electrónico del usuario desde las claims
        /// </summary>
        /// <param name="principal">ClaimsPrincipal del usuario autenticado</param>
        /// <returns>Correo electrónico o null si no se encuentra</returns>
        public static string GetUserEmail(this ClaimsPrincipal principal)
        {
            if (principal == null)
                return null;

            // Intentar obtener el correo electrónico desde la claim Email
            var claim = principal.FindFirst(ClaimTypes.Email);
            return claim?.Value;
        }
    }
}
