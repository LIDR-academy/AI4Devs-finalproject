using Asp.Versioning;

using ConsultCore31.WebAPI.DTOs.Auth;
using ConsultCore31.WebAPI.Extensions;
using ConsultCore31.WebAPI.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class AuthController : BaseApiController
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Confirma el email de un usuario
        /// </summary>
        /// <param name="userId">ID del usuario</param>
        /// <param name="token">Token de confirmación</param>
        /// <returns>Resultado de la operación</returns>
        [HttpGet("confirm-email")]
        [AllowAnonymous]
        [ProducesResponseType(200)]
        [ProducesResponseType(typeof(string), 400)]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                return BadRequest("UserId y Token son requeridos");

            var result = await _authService.ConfirmEmailAsync(userId, token);

            if (!result)
                return BadRequest("No se pudo confirmar el email");

            return Ok();
        }

        /// <summary>
        /// Solicita un restablecimiento de contraseña
        /// </summary>
        /// <param name="email">Email del usuario</param>
        /// <returns>Resultado de la operación</returns>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        [ProducesResponseType(200)]
        [ProducesResponseType(typeof(string), 400)]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {
            if (string.IsNullOrEmpty(email))
                return BadRequest("Email es requerido");

            var origin = Request.Headers["Origin"].ToString();
            var result = await _authService.ForgotPasswordAsync(email, origin);

            // Siempre devolvemos OK por seguridad, incluso si el email no existe
            return Ok();
        }

        /// <summary>
        /// Autentica un usuario y devuelve un token JWT con los datos del usuario
        /// </summary>
        /// <param name="request">Datos de login (usuario/email y contraseña)</param>
        /// <returns>Token JWT, refresh token y datos del usuario</returns>
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(AuthResponseDto), 200)]
        [ProducesResponseType(typeof(ApiResponse), 400)]
        [ProducesResponseType(typeof(ApiResponse), 401)]
        [ProducesResponseType(typeof(ApiResponse), 500)]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new ApiResponse(400, "La solicitud no puede estar vacía"));

                if (!ModelState.IsValid)
                    return BadRequest(new ApiResponse(400, "Datos de solicitud inválidos"));

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
                var result = await _authService.LoginAsync(request, ipAddress);

                if (result == null)
                    return Unauthorized(new ApiResponse(401, "Credenciales inválidas"));

                return Ok(new ApiResponse<AuthResponseDto>(200, result));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Intento de acceso no autorizado: {Message}", ex.Message);
                return Unauthorized(new ApiResponse(401, $"Acceso no autorizado: {ex.Message}"));
            }
            catch (Exception ex)
            {
                var errorReference = Guid.NewGuid().ToString();
                _logger.LogError(ex, "Error durante el proceso de login: {Message}. Referencia: {Reference}", ex.Message, errorReference);
                //return StatusCode(500, new ApiResponse(500, $"Error interno del servidor. Referencia: {errorReference}"));
                return StatusCode(500, new ApiResponse(500, $"Error durante el proceso de login: {ex.Message}. Referencia: {errorReference}"));
            }
        }

        /// <summary>
        /// Renueva un token JWT utilizando un refresh token
        /// </summary>
        /// <param name="request">Refresh token</param>
        /// <returns>Nuevo token JWT, refresh token y datos del usuario</returns>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(AuthResponseDto), 200)]
        [ProducesResponseType(typeof(string), 400)]
        [ProducesResponseType(typeof(string), 401)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            var result = await _authService.RefreshTokenAsync(request, ipAddress);

            if (result == null)
                return Unauthorized("Token inválido o expirado");

            return Ok(result);
        }

        /// <summary>
        /// Registra un nuevo usuario en el sistema
        /// </summary>
        /// <param name="request">Datos de registro</param>
        /// <returns>Resultado de la operación</returns>
        [HttpPost("register")]
        [AllowAnonymous]
        [ProducesResponseType(200)]
        [ProducesResponseType(typeof(string), 400)]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var origin = Request.Headers["Origin"].ToString();
            var result = await _authService.RegisterAsync(request, origin);

            if (!result)
                return BadRequest("No se pudo registrar el usuario");

            return Ok();
        }

        /// <summary>
        /// Restablece la contraseña de un usuario
        /// </summary>
        /// <param name="request">Datos para restablecer contraseña</param>
        /// <returns>Resultado de la operación</returns>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        [ProducesResponseType(200)]
        [ProducesResponseType(typeof(string), 400)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
        {
            var result = await _authService.ResetPasswordAsync(request);

            if (!result)
                return BadRequest("No se pudo restablecer la contraseña");

            return Ok();
        }

        /// <summary>
        /// Revoca un refresh token (logout)
        /// </summary>
        /// <param name="token">Token a revocar</param>
        /// <returns>Resultado de la operación</returns>
        [HttpPost("revoke-token")]
        [AllowAnonymous]
        [ProducesResponseType(200)]
        [ProducesResponseType(typeof(string), 400)]
        public async Task<IActionResult> RevokeToken([FromBody] string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest("Token es requerido");

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
            var result = await _authService.RevokeTokenAsync(token, ipAddress);

            if (!result)
                return BadRequest("Token inválido");

            return Ok();
        }

        /// <summary>
        /// Obtiene los datos del usuario autenticado
        /// </summary>
        /// <returns>Datos del usuario autenticado</returns>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<UserDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse), 401)]
        [ProducesResponseType(typeof(ApiResponse), 500)]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = User.GetUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new ApiResponse(401, "Usuario no autenticado"));

                var user = await _authService.GetUserByIdAsync(userId);
                if (user == null)
                    return Unauthorized(new ApiResponse(401, "Usuario no encontrado"));

                return Ok(new ApiResponse<UserDto>(200, user));
            }
            catch (Exception ex)
            {
                var errorReference = Guid.NewGuid().ToString();
                _logger.LogError(ex, "Error al obtener datos del usuario: {Message}. Referencia: {Reference}", ex.Message, errorReference);
                return StatusCode(500, new ApiResponse(500, $"Error al obtener datos del usuario: {ex.Message}. Referencia: {errorReference}"));
            }
        }

        /// <summary>
        /// Cierra la sesión del usuario actual
        /// </summary>
        /// <returns>Resultado de la operación</returns>
        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse), 200)]
        [ProducesResponseType(typeof(ApiResponse), 400)]
        [ProducesResponseType(typeof(ApiResponse), 500)]
        public async Task<IActionResult> Logout()
        {
            try
            {
                // Obtener el token de autorización del encabezado
                var authHeader = HttpContext.Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                    return BadRequest(new ApiResponse(400, "Token no proporcionado"));

                // Extraer el token
                var token = authHeader.Substring("Bearer ".Length).Trim();
                
                // Obtener el refresh token de la cookie o del cuerpo de la solicitud
                var refreshToken = Request.Cookies["refreshToken"] ?? "";
                
                // Revocar el refresh token si existe
                if (!string.IsNullOrEmpty(refreshToken))
                {
                    var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
                    await _authService.RevokeTokenAsync(refreshToken, ipAddress);
                }

                // Eliminar la cookie de refresh token si existe
                if (Request.Cookies["refreshToken"] != null)
                {
                    Response.Cookies.Delete("refreshToken");
                }

                return Ok(new ApiResponse(200, "Sesión cerrada correctamente"));
            }
            catch (Exception ex)
            {
                var errorReference = Guid.NewGuid().ToString();
                _logger.LogError(ex, "Error al cerrar sesión: {Message}. Referencia: {Reference}", ex.Message, errorReference);
                return StatusCode(500, new ApiResponse(500, $"Error al cerrar sesión: {ex.Message}. Referencia: {errorReference}"));
            }
        }
    }
}