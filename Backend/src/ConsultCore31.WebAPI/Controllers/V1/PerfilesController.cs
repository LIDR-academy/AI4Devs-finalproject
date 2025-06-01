using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConsultCore31.Application.DTOs.Perfil;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers.V1
{
    /// <summary>
    /// Controlador para la gestión de perfiles
    /// </summary>
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class PerfilesController : BaseApiController
    {
        private readonly IPerfilService _perfilService;
        private readonly ILogger<PerfilesController> _logger;

        public PerfilesController(
            IPerfilService perfilService,
            ILogger<PerfilesController> logger)
        {
            _perfilService = perfilService ?? throw new ArgumentNullException(nameof(perfilService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Obtiene todos los perfiles
        /// </summary>
        /// <returns>Lista de perfiles</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<PerfilDto>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var perfiles = await _perfilService.GetAllPerfilesAsync();
                return Ok(perfiles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los perfiles");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Obtiene un perfil por su ID
        /// </summary>
        /// <param name="id">ID del perfil</param>
        /// <returns>Perfil encontrado</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PerfilDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var perfil = await _perfilService.GetPerfilByIdAsync(id);
                if (perfil == null)
                {
                    return NotFound(new { message = $"No se encontró el perfil con ID: {id}" });
                }
                return Ok(perfil);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el perfil con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Crea un nuevo perfil
        /// </summary>
        /// <param name="createPerfilDto">Datos del perfil a crear</param>
        /// <returns>Perfil creado</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(PerfilDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] CreatePerfilDto createPerfilDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var perfilCreado = await _perfilService.CreatePerfilAsync(createPerfilDto);
                return CreatedAtAction(nameof(GetById), new { id = perfilCreado.Id, version = "1" }, perfilCreado);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el perfil");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Actualiza un perfil existente
        /// </summary>
        /// <param name="id">ID del perfil a actualizar</param>
        /// <param name="updatePerfilDto">Datos actualizados del perfil</param>
        /// <returns>Resultado de la operación</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePerfilDto updatePerfilDto)
        {
            try
            {
                if (id != updatePerfilDto.Id)
                {
                    return BadRequest(new { message = "El ID de la ruta no coincide con el ID del perfil" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var resultado = await _perfilService.UpdatePerfilAsync(updatePerfilDto);
                if (!resultado)
                {
                    return NotFound(new { message = $"No se encontró el perfil con ID: {id}" });
                }

                return Ok(new { message = "Perfil actualizado correctamente" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el perfil con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Elimina un perfil por su ID
        /// </summary>
        /// <param name="id">ID del perfil a eliminar</param>
        /// <returns>Resultado de la operación</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var resultado = await _perfilService.DeletePerfilAsync(id);
                if (!resultado)
                {
                    return NotFound(new { message = $"No se encontró el perfil con ID: {id}" });
                }

                return Ok(new { message = "Perfil eliminado correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el perfil con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Ocurrió un error al procesar la solicitud");
            }
        }
    }
}
