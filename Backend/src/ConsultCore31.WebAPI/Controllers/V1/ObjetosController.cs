using Asp.Versioning;

using ConsultCore31.Application.DTOs.Objeto;
using ConsultCore31.Application.Interfaces;

using Microsoft.AspNetCore.Mvc;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para la gestión de objetos
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class ObjetosController : BaseApiController
    {
        private readonly IObjetoService _objetoService;
        private readonly ILogger<ObjetosController> _logger;

        public ObjetosController(
            IObjetoService objetoService,
            ILogger<ObjetosController> logger)
        {
            _objetoService = objetoService ?? throw new ArgumentNullException(nameof(objetoService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Obtiene todos los objetos con información de su tipo
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ObjetoDto>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var objetos = await _objetoService.GetAllObjetosAsync();
                return Ok(objetos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los objetos");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Obtiene un objeto con información de su tipo por ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ObjetoDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var objeto = await _objetoService.GetObjetoByIdAsync(id);
                if (objeto == null)
                {
                    return NotFound(new { message = $"No se encontró el objeto con ID: {id}" });
                }
                return Ok(objeto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el objeto con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Crea un nuevo objeto
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(ObjetoDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] CreateObjetoDto createObjetoDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var objetoCreado = await _objetoService.CreateObjetoAsync(createObjetoDto);
                return CreatedAtAction(nameof(GetById), new { id = objetoCreado.Id, version = "1" }, objetoCreado);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el objeto");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Actualiza un objeto existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateObjetoDto updateObjetoDto)
        {
            try
            {
                if (id != updateObjetoDto.Id)
                {
                    return BadRequest(new { message = "El ID de la ruta no coincide con el ID del objeto" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var resultado = await _objetoService.UpdateObjetoAsync(updateObjetoDto);
                if (!resultado)
                {
                    return NotFound(new { message = $"No se encontró el objeto con ID: {id}" });
                }

                return Ok(new { message = "Objeto actualizado correctamente" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el objeto con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Elimina un objeto por su ID
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var resultado = await _objetoService.DeleteObjetoAsync(id);
                if (!resultado)
                {
                    return NotFound(new { message = $"No se encontró el objeto con ID: {id}" });
                }

                return Ok(new { message = "Objeto eliminado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el objeto con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }
    }
}