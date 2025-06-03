using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ConsultCore31.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.WebAPI.Controllers
{
    /// <summary>
    /// Controlador base genérico para operaciones CRUD
    /// </summary>
    /// <typeparam name="TDto">Tipo del DTO de respuesta</typeparam>
    /// <typeparam name="TCreateDto">Tipo del DTO para crear</typeparam>
    /// <typeparam name="TUpdateDto">Tipo del DTO para actualizar</typeparam>
    /// <typeparam name="TKey">Tipo de la clave primaria</typeparam>
    public abstract class GenericController<TDto, TCreateDto, TUpdateDto, TKey> : BaseApiController
        where TKey : IEquatable<TKey>
    {
        protected readonly IGenericService<TDto, TCreateDto, TUpdateDto, TKey> _service;
        protected readonly ILogger _logger;
        protected readonly string _entityName;

        protected GenericController(
            IGenericService<TDto, TCreateDto, TUpdateDto, TKey> service,
            ILogger logger,
            string entityName)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _entityName = entityName ?? throw new ArgumentNullException(nameof(entityName));
        }

        /// <summary>
        /// Obtiene todas las entidades
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public virtual async Task<IActionResult> GetAll()
        {
            try
            {
                var entities = await _service.GetAllAsync();
                return Ok(entities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener todos los {_entityName}");
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public virtual async Task<IActionResult> GetById(TKey id)
        {
            try
            {
                var entity = await _service.GetByIdAsync(id);
                if (entity == null)
                {
                    return NotFound(new { message = $"No se encontró el {_entityName} con ID: {id}" });
                }
                return Ok(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el {_entityName} con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public virtual async Task<IActionResult> Create([FromBody] TCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdEntity = await _service.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = GetIdFromDto(createdEntity), version = "1" }, createdEntity);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al crear el {_entityName}");
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public virtual async Task<IActionResult> Update(TKey id, [FromBody] TUpdateDto updateDto)
        {
            try
            {
                if (!IsIdMatchingDto(id, updateDto))
                {
                    return BadRequest(new { message = $"El ID de la ruta no coincide con el ID del {_entityName}" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var resultado = await _service.UpdateAsync(updateDto);
                if (!resultado)
                {
                    return NotFound(new { message = $"No se encontró el {_entityName} con ID: {id}" });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el {_entityName} con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Elimina una entidad por su ID
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public virtual async Task<IActionResult> Delete(TKey id)
        {
            try
            {
                var resultado = await _service.DeleteAsync(id);
                if (!resultado)
                {
                    return NotFound(new { message = $"No se encontró el {_entityName} con ID: {id}" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el {_entityName} con ID: {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrió un error al procesar la solicitud");
            }
        }

        /// <summary>
        /// Obtiene el ID de la entidad desde el DTO
        /// </summary>
        protected abstract TKey GetIdFromDto(TDto dto);

        /// <summary>
        /// Verifica si el ID de la ruta coincide con el ID del DTO
        /// </summary>
        protected abstract bool IsIdMatchingDto(TKey id, TUpdateDto updateDto);
    }
}
