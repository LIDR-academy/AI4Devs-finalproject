using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.UsuarioToken;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para la gestión de tokens de usuario
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize] // Requiere autenticación para acceder a estos endpoints
    public class UsuarioTokensController : BaseApiController
    {
        private readonly IUsuarioTokenService _usuarioTokenService;
        private readonly ILogger<UsuarioTokensController> _logger;

        public UsuarioTokensController(
            IUsuarioTokenService usuarioTokenService,
            ILogger<UsuarioTokensController> logger)
        {
            _usuarioTokenService = usuarioTokenService ?? throw new ArgumentNullException(nameof(usuarioTokenService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Obtiene un token por su valor
        /// </summary>
        [HttpGet("{token}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UsuarioTokenDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetToken(Guid token)
        {
            try
            {
                var tokenDto = await _usuarioTokenService.GetTokenAsync(token);
                if (tokenDto == null)
                {
                    return NotFound(new { message = "Token no encontrado" });
                }
                return Ok(tokenDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el token: {token}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Crea un nuevo token de usuario
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(UsuarioTokenDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateToken([FromBody] CreateUsuarioTokenDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var tokenCreado = await _usuarioTokenService.CreateTokenAsync(createDto);
                return CreatedAtAction(nameof(GetToken), new { token = tokenCreado.Token, version = "1" }, tokenCreado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el token de usuario");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Valida un token
        /// </summary>
        [HttpPost("validate")]
        [AllowAnonymous] // Permite acceso sin autenticación para validar tokens
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TokenValidationResultDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ValidateToken([FromBody] ValidateTokenDto validateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var resultado = await _usuarioTokenService.ValidateTokenAsync(validateDto.Token);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al validar el token");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Invalida todos los tokens de un usuario
        /// </summary>
        /// <param name="usuarioId">Identificador numérico único del usuario</param>
        /// <param name="motivo">Motivo de la invalidación (opcional)</param>
        /// <returns>Resultado de la operación</returns>
        /// <response code="200">Tokens invalidados correctamente</response>
        /// <response code="400">Si el ID de usuario no es válido</response>
        /// <response code="404">Si no se encuentra el usuario</response>
        /// <response code="500">Si ocurre un error interno</response>
        [HttpPost("invalidate/{usuarioId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> InvalidateUserTokens(string usuarioId, [FromQuery] string motivo = null)
        {
            if (string.IsNullOrWhiteSpace(usuarioId))
            {
                _logger.LogWarning("Se intentó invalidar tokens con un ID de usuario vacío");
                return BadRequest(new ProblemDetails
                {
                    Title = "Solicitud inválida",
                    Detail = "El ID de usuario no puede estar vacío",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            if (!int.TryParse(usuarioId, out int usuarioIdInt) || usuarioIdInt <= 0)
            {
                _logger.LogWarning("ID de usuario no válido: {UsuarioId}", usuarioId);
                return BadRequest(new ProblemDetails
                {
                    Title = "Solicitud inválida",
                    Detail = "El ID de usuario debe ser un número entero positivo",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                _logger.LogInformation("Solicitud para invalidar tokens del usuario {UsuarioId} desde IP: {IpAddress}", 
                    usuarioIdInt, ipAddress);
                
                await _usuarioTokenService.InvalidateUserTokensAsync(usuarioIdInt, ipAddress, motivo);
                
                _logger.LogInformation("Tokens invalidados exitosamente para el usuario: {UsuarioId}", usuarioIdInt);
                
                return Ok(new 
                { 
                    Success = true,
                    Message = "Todos los tokens del usuario han sido invalidados correctamente",
                    UsuarioId = usuarioIdInt
                });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "No se encontró el usuario con ID: {UsuarioId}", usuarioIdInt);
                return NotFound(new ProblemDetails
                {
                    Title = "Usuario no encontrado",
                    Detail = $"No se encontró un usuario con el ID: {usuarioIdInt}",
                    Status = StatusCodes.Status404NotFound
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Error de argumento al invalidar tokens para el usuario: {UsuarioId}", usuarioIdInt);
                return BadRequest(new ProblemDetails
                {
                    Title = "Solicitud inválida",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al invalidar los tokens del usuario: {UsuarioId}", usuarioIdInt);
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Error interno del servidor",
                    Detail = "Ocurrió un error al procesar la solicitud. Por favor, intente nuevamente más tarde.",
                    Status = StatusCodes.Status500InternalServerError,
                    Instance = HttpContext.Request.Path
                });
            }
        }

        /// <summary>
        /// Marca un token como utilizado
        /// </summary>
        [HttpPost("mark-used/{token}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> MarkTokenAsUsed(Guid token, [FromQuery] string motivo = null)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _usuarioTokenService.MarkAsUsedAsync(token, ipAddress, motivo);
                return Ok(new { message = "El token ha sido marcado como utilizado" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al marcar el token como usado: {token}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Elimina tokens expirados
        /// </summary>
        [HttpDelete("expired")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        public async Task<IActionResult> RemoveExpiredTokens()
        {
            try
            {
                var count = await _usuarioTokenService.RemoveExpiredTokensAsync();
                return Ok(new { message = $"Se eliminaron {count} tokens expirados" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar tokens expirados");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }
    }
}
