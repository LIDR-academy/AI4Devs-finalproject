using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.ObjetoTipo;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para la gestión de tipos de objeto
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class ObjetosTipoController : BaseApiController
    {
        private readonly IObjetoTipoService _objetoTipoService;
        private readonly ILogger<ObjetosTipoController> _logger;

        public ObjetosTipoController(
            IObjetoTipoService objetoTipoService,
            ILogger<ObjetosTipoController> logger)
        {
            _objetoTipoService = objetoTipoService ?? throw new ArgumentNullException(nameof(objetoTipoService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Obtiene todos los tipos de objeto
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ObjetoTipoDto>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var tiposObjeto = await _objetoTipoService.GetAllObjetoTiposAsync();
                return Ok(tiposObjeto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los tipos de objeto");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Obtiene un tipo de objeto por su ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ObjetoTipoDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var tipoObjeto = await _objetoTipoService.GetObjetoTipoByIdAsync(id);
                if (tipoObjeto == null)
                {
                    return NotFound(new { message = $"No se encontró el tipo de objeto con ID: {id}" });
                }
                return Ok(tipoObjeto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el tipo de objeto con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Obtiene todos los tipos de objeto activos
        /// </summary>
        [HttpGet("activos")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ObjetoTipoDto>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetActivos()
        {
            try
            {
                var tiposActivos = await _objetoTipoService.GetActiveObjetoTiposAsync();
                return Ok(tiposActivos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los tipos de objeto activos");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Crea un nuevo tipo de objeto
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(ObjetoTipoDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] CreateObjetoTipoDto createObjetoTipoDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var objetoTipoCreado = await _objetoTipoService.CreateObjetoTipoAsync(createObjetoTipoDto);
                return CreatedAtAction(nameof(GetById), new { id = objetoTipoCreado.Id, version = "1" }, objetoTipoCreado);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el tipo de objeto");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Actualiza un tipo de objeto existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateObjetoTipoDto updateObjetoTipoDto)
        {
            try
            {
                if (id != updateObjetoTipoDto.Id)
                {
                    return BadRequest(new { message = "El ID de la ruta no coincide con el ID del tipo de objeto" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var resultado = await _objetoTipoService.UpdateObjetoTipoAsync(updateObjetoTipoDto);
                if (!resultado)
                {
                    return NotFound(new { message = $"No se encontró el tipo de objeto con ID: {id}" });
                }

                return Ok(new { message = "Tipo de objeto actualizado correctamente" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el tipo de objeto con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Elimina un tipo de objeto por su ID
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var resultado = await _objetoTipoService.DeleteObjetoTipoAsync(id);
                if (!resultado)
                {
                    return NotFound(new { message = $"No se encontró el tipo de objeto con ID: {id}" });
                }

                return Ok(new { message = "Tipo de objeto eliminado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el tipo de objeto con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }
    }
}
