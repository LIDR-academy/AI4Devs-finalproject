using ConsultCore31.Application.DTOs.Acceso;
using ConsultCore31.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para la gestión de accesos
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize] // Requiere autenticación para acceder a estos endpoints
    public class AccesosController : BaseApiController
    {
        private readonly IAccesoService _accesoService;
        private readonly ILogger<AccesosController> _logger;

        public AccesosController(
            IAccesoService accesoService,
            ILogger<AccesosController> logger)
        {
            _accesoService = accesoService ?? throw new ArgumentNullException(nameof(accesoService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Obtiene todos los accesos con detalles
        /// </summary>
        /// <returns>Lista de todos los accesos</returns>
        /// <response code="200">Devuelve la lista de accesos</response>
        /// <response code="500">Si ocurre un error interno</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<AccesoDto>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ProblemDetails))]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Obteniendo todos los accesos");

            try
            {
                var accesos = await _accesoService.GetAllAccesosAsync();
                _logger.LogDebug("Se obtuvieron {Count} accesos", accesos?.Count() ?? 0);
                return Ok(accesos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los accesos");
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Error interno del servidor",
                    Detail = "Ocurrió un error al obtener los accesos",
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }

        /// <summary>
        /// Obtiene un acceso por su ID compuesto (perfilId y objetoId)
        /// </summary>
        /// <param name="perfilId">Identificador único del perfil (debe ser mayor a 0)</param>
        /// <param name="objetoId">Identificador único del objeto (debe ser mayor a 0)</param>
        /// <returns>El acceso solicitado o un código de error</returns>
        /// <response code="200">Devuelve el acceso solicitado</response>
        /// <response code="400">Si los parámetros no son válidos</response>
        /// <response code="404">Si no se encuentra el acceso</response>
        /// <response code="500">Si ocurre un error interno</response>
        [HttpGet("{perfilId:int:min(1)}/{objetoId:int:min(1)}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AccesoDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ProblemDetails))]
        public async Task<IActionResult> GetByIds(int perfilId, int objetoId)
        {
            _logger.LogInformation("Obteniendo acceso para perfilId: {PerfilId}, objetoId: {ObjetoId}", perfilId, objetoId);

            try
            {
                var acceso = await _accesoService.GetAccesoByIdsAsync(perfilId, objetoId);
                if (acceso == null)
                {
                    _logger.LogWarning("Acceso no encontrado para perfilId: {PerfilId}, objetoId: {ObjetoId}", perfilId, objetoId);
                    return NotFound(new ProblemDetails
                    {
                        Title = "Acceso no encontrado",
                        Detail = $"No se encontró el acceso para perfilId: {perfilId}, objetoId: {objetoId}",
                        Status = StatusCodes.Status404NotFound
                    });
                }
                return Ok(acceso);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el acceso para perfilId: {PerfilId}, objetoId: {ObjetoId}", perfilId, objetoId);
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Error interno del servidor",
                    Detail = "Ocurrió un error al procesar la solicitud",
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }

        /// <summary>
        /// Obtiene todos los accesos activos para un perfil específico
        /// </summary>
        /// <param name="perfilId">Identificador único del perfil (debe ser mayor a 0)</param>
        /// <returns>Lista de accesos activos para el perfil</returns>
        /// <response code="200">Devuelve la lista de accesos activos</response>
        /// <response code="400">Si el perfilId no es válido</response>
        /// <response code="500">Si ocurre un error interno</response>
        /// <summary>
        /// Obtiene todos los accesos activos para un perfil específico
        /// </summary>
        /// <param name="perfilId">Identificador único del perfil (debe ser mayor a 0)</param>
        /// <returns>Lista de accesos activos para el perfil</returns>
        /// <response code="200">Devuelve la lista de accesos activos</response>
        /// <response code="400">Si el perfilId no es válido</response>
        /// <response code="404">Si no se encuentra el perfil</response>
        /// <response code="500">Si ocurre un error interno</response>
        [HttpGet("perfil/{perfilId:int:min(1)}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<AccesoDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ProblemDetails))]
        public async Task<IActionResult> GetByPerfilId(int perfilId)
        {
            _logger.LogInformation("Obteniendo accesos activos para perfilId: {PerfilId}", perfilId);

            try
            {
                var accesos = await _accesoService.GetAccesosActivosByPerfilIdAsync(perfilId);

                if (accesos == null || !accesos.Any())
                {
                    _logger.LogWarning("No se encontraron accesos activos para el perfilId: {PerfilId}", perfilId);
                    return NotFound(new ProblemDetails
                    {
                        Title = "No se encontraron accesos",
                        Detail = $"No se encontraron accesos activos para el perfil con ID: {perfilId}",
                        Status = StatusCodes.Status404NotFound
                    });
                }

                _logger.LogDebug("Se obtuvieron {Count} accesos activos para perfilId: {PerfilId}", accesos.Count(), perfilId);
                return Ok(accesos);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "No se encontró el perfil con ID: {PerfilId}", perfilId);
                return NotFound(new ProblemDetails
                {
                    Title = "Perfil no encontrado",
                    Detail = $"No se encontró el perfil con ID: {perfilId}",
                    Status = StatusCodes.Status404NotFound
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los accesos para el perfil: {PerfilId}", perfilId);
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Error interno del servidor",
                    Detail = "Ocurrió un error al obtener los accesos del perfil",
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }

        /// <summary>
        /// Crea o actualiza un acceso
        /// </summary>
        /// <param name="dto">Datos del acceso a crear o actualizar</param>
        /// <returns>El acceso creado o actualizado</returns>
        /// <response code="200">Devuelve el acceso creado o actualizado</response>
        /// <response code="400">Si los datos del acceso no son válidos</response>
        /// <response code="404">Si no se encuentra el perfil o el objeto</response>
        /// <response code="500">Si ocurre un error interno</response>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AccesoDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ProblemDetails))]
        public async Task<IActionResult> CreateOrUpdate([FromBody] CreateOrUpdateAccesoDto dto)
        {
            // Validación de entrada
            if (dto == null)
            {
                _logger.LogWarning("Intento de crear/actualizar acceso con DTO nulo");
                return BadRequest(new ProblemDetails
                {
                    Title = "Solicitud inválida",
                    Detail = "El cuerpo de la solicitud no puede estar vacío",
                    Status = StatusCodes.Status400BadRequest
                });
            }

            // Validar el modelo
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Datos de entrada no válidos: {ModelState}", ModelState);
                return ValidationProblem(new ValidationProblemDetails(ModelState) { Title = "Datos de entrada inválidos" });
            }

            try
            {
                _logger.LogInformation("Iniciando creación/actualización de acceso para PerfilId: {PerfilId}, ObjetoId: {ObjetoId}", dto.PerfilId, dto.ObjetoId);

                // Mapear el DTO a la entidad
                var accesoDto = new AccesoDto
                {
                    PerfilId = dto.PerfilId,
                    ObjetoId = dto.ObjetoId,
                    Activo = dto.Activo
                };

                // Llamar al servicio
                var result = await _accesoService.CreateOrUpdateAccesoAsync(accesoDto);

                _logger.LogInformation("Acceso creado/actualizado exitosamente para perfilId: {PerfilId}, objetoId: {ObjetoId}",
                    dto.PerfilId, dto.ObjetoId);

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Recurso no encontrado al crear/actualizar acceso. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}",
                    dto.PerfilId, dto.ObjetoId);

                return NotFound(new ProblemDetails
                {
                    Title = "Recurso no encontrado",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound,
                    Instance = HttpContext.Request.Path
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Argumento inválido al crear/actualizar acceso. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}",
                    dto.PerfilId, dto.ObjetoId);

                return BadRequest(new ProblemDetails
                {
                    Title = "Solicitud inválida",
                    Detail = ex.Message,
                    Status = StatusCodes.Status400BadRequest,
                    Instance = HttpContext.Request.Path
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al crear o actualizar el acceso. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}",
                    dto.PerfilId, dto.ObjetoId);

                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Error interno del servidor",
                    Detail = "Se ha producido un error al procesar la solicitud. Por favor, inténtelo de nuevo más tarde.",
                    Status = StatusCodes.Status500InternalServerError,
                    Instance = HttpContext.Request.Path
                });
            }
        }

        /// <summary>
        /// Actualiza el estado de un acceso
        /// </summary>
        /// <param name="perfilId">Identificador único del perfil (debe ser mayor a 0)</param>
        /// <param name="objetoId">Identificador único del objeto (debe ser mayor a 0)</param>
        /// <param name="activo">Nuevo estado del acceso</param>
        /// <returns>El acceso actualizado o un código de error</returns>
        /// <response code="200">Devuelve el acceso con el estado actualizado</response>
        /// <response code="400">Si los parámetros no son válidos</response>
        /// <response code="404">Si no se encuentra el acceso, perfil u objeto</response>
        /// <response code="500">Si ocurre un error interno</response>
        [HttpPut("{perfilId:int:min(1)}/{objetoId:int:min(1)}/estado")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AccesoDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ProblemDetails))]
        public async Task<IActionResult> UpdateStatus(int perfilId, int objetoId, [FromBody] bool activo)
        {
            _logger.LogInformation("Solicitud para actualizar estado de acceso. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}, Nuevo estado: {Activo}",
                perfilId, objetoId, activo);

            try
            {
                // Verificar si el acceso existe
                var accesoExistente = await _accesoService.GetAccesoByIdsAsync(perfilId, objetoId);
                if (accesoExistente == null)
                {
                    _logger.LogWarning("Intento de actualizar estado de acceso no encontrado. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}",
                        perfilId, objetoId);
                    return NotFound(new ProblemDetails
                    {
                        Title = "Acceso no encontrado",
                        Detail = $"No se encontró un acceso para el perfilId: {perfilId} y objetoId: {objetoId}",
                        Status = StatusCodes.Status404NotFound,
                        Instance = HttpContext.Request.Path
                    });
                }

                // Verificar si el estado actual es igual al nuevo estado
                if (accesoExistente.Activo == activo)
                {
                    _logger.LogInformation("El acceso ya tiene el estado solicitado. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}, Estado actual: {Estado}",
                        perfilId, objetoId, activo);
                    return Ok(accesoExistente);
                }

                // Actualizar el estado
                var resultado = await _accesoService.UpdateAccesoStatusAsync(perfilId, objetoId, activo);
                if (!resultado)
                {
                    _logger.LogError("Error al actualizar el estado del acceso. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}",
                        perfilId, objetoId);
                    return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                    {
                        Title = "Error al actualizar el acceso",
                        Detail = "No se pudo actualizar el estado del acceso",
                        Status = StatusCodes.Status500InternalServerError,
                        Instance = HttpContext.Request.Path
                    });
                }

                // Obtener el acceso actualizado para devolverlo
                var accesoActualizado = await _accesoService.GetAccesoByIdsAsync(perfilId, objetoId);

                _logger.LogInformation("Estado de acceso actualizado correctamente. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}, Nuevo estado: {Activo}",
                    perfilId, objetoId, activo);

                return Ok(accesoActualizado);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Recurso no encontrado al actualizar estado de acceso. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}",
                    perfilId, objetoId);
                return NotFound(new ProblemDetails
                {
                    Title = "Recurso no encontrado",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound,
                    Instance = HttpContext.Request.Path
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al actualizar estado de acceso. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}",
                    perfilId, objetoId);
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Error interno del servidor",
                    Detail = $"Error al actualizar el estado del acceso: {ex.Message}",
                    Status = StatusCodes.Status500InternalServerError,
                    Instance = HttpContext.Request.Path
                });
            }
        }

        /// <summary>
        /// Verifica si un perfil tiene acceso a un objeto específico
        /// </summary>
        /// <param name="perfilId">Identificador único del perfil (debe ser mayor a 0)</param>
        /// <param name="objetoId">Identificador único del objeto (debe ser mayor a 0)</param>
        /// <returns>Resultado de la verificación de acceso</returns>
        /// <response code="200">Verificación de acceso exitosa</response>
        /// <response code="400">Si los parámetros no son válidos</response>
        /// <response code="500">Si ocurre un error interno</response>
        /// <remarks>
        /// Este endpoint es público y no requiere autenticación
        /// </remarks>
        /// <summary>
        /// Verifica si un perfil tiene acceso a un objeto específico
        /// </summary>
        /// <param name="perfilId">Identificador único del perfil (debe ser mayor a 0)</param>
        /// <param name="objetoId">Identificador único del objeto (debe ser mayor a 0)</param>
        /// <returns>Resultado de la verificación de acceso</returns>
        /// <response code="200">Verificación de acceso exitosa</response>
        /// <response code="400">Si los parámetros no son válidos</response>
        /// <response code="404">Si no se encuentra el perfil o el objeto</response>
        /// <response code="500">Si ocurre un error interno</response>
        /// <remarks>
        /// Este endpoint es público y no requiere autenticación
        /// </remarks>
        [HttpGet("verificar/{perfilId:int:min(1)}/{objetoId:int:min(1)}")]
        [AllowAnonymous] // Permite acceso sin autenticación para verificar accesos
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VerificarAccesoDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ProblemDetails))]
        public async Task<IActionResult> VerificarAcceso(int perfilId, int objetoId)
        {
            _logger.LogInformation("Verificando acceso para perfilId: {PerfilId}, objetoId: {ObjetoId}",
                perfilId, objetoId);

            try
            {
                var resultado = await _accesoService.VerificarAccesoAsync(perfilId, objetoId);
                _logger.LogDebug("Resultado de verificación para perfilId: {PerfilId}, objetoId: {ObjetoId}: {@Resultado}",
                    perfilId, objetoId, resultado);
                return Ok(resultado);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Recurso no encontrado al verificar acceso");
                return NotFound(new ProblemDetails
                {
                    Title = "Recurso no encontrado",
                    Detail = ex.Message,
                    Status = StatusCodes.Status404NotFound
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar el acceso para perfilId: {PerfilId}, objetoId: {ObjetoId}",
                    perfilId, objetoId);
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Error interno del servidor",
                    Detail = "Ocurrió un error al verificar el acceso",
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }

        /// <summary>
        /// Elimina un acceso
        /// </summary>
        /// <param name="perfilId">Identificador único del perfil (debe ser mayor a 0)</param>
        /// <param name="objetoId">Identificador único del objeto (debe ser mayor a 0)</param>
        /// <returns>True si la eliminación fue exitosa</returns>
        /// <response code="200">Eliminación exitosa</response>
        /// <response code="400">Si los parámetros no son válidos</response>
        /// <response code="404">Si no se encuentra el acceso</response>
        /// <response code="500">Si ocurre un error interno</response>
        [HttpDelete("{perfilId:int:min(1)}/{objetoId:int:min(1)}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(ProblemDetails))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(ProblemDetails))]
        public async Task<IActionResult> Delete(int perfilId, int objetoId)
        {
            _logger.LogInformation("Eliminando acceso para perfilId: {PerfilId}, objetoId: {ObjetoId}",
                perfilId, objetoId);

            try
            {
                var resultado = await _accesoService.DeleteAccesoAsync(perfilId, objetoId);
                if (!resultado)
                {
                    _logger.LogWarning("No se encontró el acceso para eliminar. PerfilId: {PerfilId}, ObjetoId: {ObjetoId}",
                        perfilId, objetoId);
                    return NotFound(new ProblemDetails
                    {
                        Title = "Acceso no encontrado",
                        Detail = $"No se encontró el acceso para perfilId: {perfilId}, objetoId: {objetoId}",
                        Status = StatusCodes.Status404NotFound
                    });
                }

                _logger.LogInformation("Acceso eliminado correctamente para perfilId: {PerfilId}, objetoId: {ObjetoId}",
                    perfilId, objetoId);
                return Ok(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el acceso para perfilId: {PerfilId}, objetoId: {ObjetoId}",
                    perfilId, objetoId);
                return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
                {
                    Title = "Error interno del servidor",
                    Detail = "Ocurrió un error al eliminar el acceso",
                    Status = StatusCodes.Status500InternalServerError
                });
            }
        }
    }
}