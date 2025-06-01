using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.Objeto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio de Objeto
    /// </summary>
    public class ObjetoService : IObjetoService
    {
        private readonly IObjetoRepository _objetoRepository;
        private readonly IObjetoTipoRepository _objetoTipoRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ObjetoService> _logger;

        public ObjetoService(
            IObjetoRepository objetoRepository,
            IObjetoTipoRepository objetoTipoRepository,
            IMapper mapper,
            ILogger<ObjetoService> logger)
        {
            _objetoRepository = objetoRepository ?? throw new ArgumentNullException(nameof(objetoRepository));
            _objetoTipoRepository = objetoTipoRepository ?? throw new ArgumentNullException(nameof(objetoTipoRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<ObjetoDto>> GetAllObjetosAsync()
        {
            try
            {
                var objetos = await _objetoRepository.GetAllWithTipoAsync();
                return _mapper.Map<IEnumerable<ObjetoDto>>(objetos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los objetos");
                throw;
            }
        }

        public async Task<ObjetoDto> GetObjetoByIdAsync(int id)
        {
            try
            {
                var objeto = await _objetoRepository.GetByIdWithTipoAsync(id);
                if (objeto == null)
                {
                    return null;
                }
                return _mapper.Map<ObjetoDto>(objeto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el objeto con ID: {id}");
                throw;
            }
        }

        public async Task<ObjetoDto> CreateObjetoAsync(CreateObjetoDto createObjetoDto)
        {
            try
            {
                // Validar que no exista un objeto con el mismo nombre
                if (await _objetoRepository.ExistsByNombreAsync(createObjetoDto.Nombre))
                {
                    throw new InvalidOperationException("Ya existe un objeto con el nombre proporcionado.");
                }

                // Validar que exista el tipo de objeto
                var objetoTipo = await _objetoTipoRepository.GetByIdAsync(createObjetoDto.TipoObjetoId);
                if (objetoTipo == null)
                {
                    throw new InvalidOperationException("El tipo de objeto especificado no existe.");
                }

                var objeto = _mapper.Map<Objeto>(createObjetoDto);
                var objetoCreado = await _objetoRepository.AddAsync(objeto);
                
                // Cargar la relación con ObjetoTipo para el mapeo
                objetoCreado.ObjetoTipo = objetoTipo;
                
                return _mapper.Map<ObjetoDto>(objetoCreado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el objeto");
                throw;
            }
        }

        public async Task<bool> UpdateObjetoAsync(UpdateObjetoDto updateObjetoDto)
        {
            try
            {
                // Validar que el objeto exista
                var objetoExistente = await _objetoRepository.GetByIdAsync(updateObjetoDto.Id);
                if (objetoExistente == null)
                {
                    return false;
                }

                // Validar que no exista otro objeto con el mismo nombre
                if (await _objetoRepository.ExistsByNombreAsync(updateObjetoDto.Nombre, updateObjetoDto.Id))
                {
                    throw new InvalidOperationException("Ya existe otro objeto con el nombre proporcionado.");
                }

                // Validar que exista el tipo de objeto
                var objetoTipo = await _objetoTipoRepository.GetByIdAsync(updateObjetoDto.TipoObjetoId);
                if (objetoTipo == null)
                {
                    throw new InvalidOperationException("El tipo de objeto especificado no existe.");
                }


                // Actualizar propiedades
                objetoExistente.ObjetoNombre = updateObjetoDto.Nombre;
                objetoExistente.ObjetoTipoId = updateObjetoDto.TipoObjetoId;
                objetoExistente.ObjetoActivo = updateObjetoDto.Activo;

                // Guardar cambios
                await _objetoRepository.UpdateAsync(objetoExistente);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el objeto con ID: {updateObjetoDto?.Id}");
                throw;
            }
        }

        public async Task<bool> DeleteObjetoAsync(int id)
        {
            try
            {
                var objeto = await _objetoRepository.GetByIdAsync(id);
                if (objeto == null)
                {
                    return false;
                }

                await _objetoRepository.DeleteAsync(objeto);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el objeto con ID: {id}");
                throw;
            }
        }
    }
}
