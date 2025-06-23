using AutoMapper;

using ConsultCore31.Application.DTOs.ObjetoTipo;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio de ObjetoTipo
    /// </summary>
    public class ObjetoTipoService : IObjetoTipoService
    {
        private readonly IObjetoTipoRepository _objetoTipoRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<ObjetoTipoService> _logger;

        public ObjetoTipoService(
            IObjetoTipoRepository objetoTipoRepository,
            IMapper mapper,
            ILogger<ObjetoTipoService> logger)
        {
            _objetoTipoRepository = objetoTipoRepository ?? throw new ArgumentNullException(nameof(objetoTipoRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<ObjetoTipoDto>> GetAllObjetoTiposAsync()
        {
            try
            {
                var tiposObjeto = await _objetoTipoRepository.ListAllAsync();
                return _mapper.Map<IEnumerable<ObjetoTipoDto>>(tiposObjeto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los tipos de objeto");
                throw;
            }
        }

        public async Task<ObjetoTipoDto> GetObjetoTipoByIdAsync(int id)
        {
            try
            {
                var tipoObjeto = await _objetoTipoRepository.GetByIdAsync(id);
                return _mapper.Map<ObjetoTipoDto>(tipoObjeto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el tipo de objeto con ID: {id}");
                throw;
            }
        }

        public async Task<IEnumerable<ObjetoTipoDto>> GetActiveObjetoTiposAsync()
        {
            try
            {
                var tiposActivos = await _objetoTipoRepository.GetAllActiveAsync();
                return _mapper.Map<IEnumerable<ObjetoTipoDto>>(tiposActivos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los tipos de objeto activos");
                throw;
            }
        }

        public async Task<ObjetoTipoDto> CreateObjetoTipoAsync(CreateObjetoTipoDto createObjetoTipoDto)
        {
            try
            {
                // Validar que no exista un tipo de objeto con el mismo nombre
                if (await _objetoTipoRepository.ExistsByNombreAsync(createObjetoTipoDto.Nombre))
                {
                    throw new InvalidOperationException("Ya existe un tipo de objeto con el nombre proporcionado.");
                }

                var objetoTipo = _mapper.Map<ObjetoTipo>(createObjetoTipoDto);
                var objetoTipoCreado = await _objetoTipoRepository.AddAsync(objetoTipo);
                return _mapper.Map<ObjetoTipoDto>(objetoTipoCreado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el tipo de objeto");
                throw;
            }
        }

        public async Task<bool> UpdateObjetoTipoAsync(UpdateObjetoTipoDto updateObjetoTipoDto)
        {
            try
            {
                // Validar que el tipo de objeto exista
                var objetoTipoExistente = await _objetoTipoRepository.GetByIdAsync(updateObjetoTipoDto.Id);
                if (objetoTipoExistente == null)
                {
                    return false;
                }

                // Validar que no exista otro tipo de objeto con el mismo nombre
                if (await _objetoTipoRepository.ExistsByNombreAsync(updateObjetoTipoDto.Nombre, updateObjetoTipoDto.Id))
                {
                    throw new InvalidOperationException("Ya existe otro tipo de objeto con el nombre proporcionado.");
                }

                // Actualizar propiedades
                objetoTipoExistente.ObjetoTipoNombre = updateObjetoTipoDto.Nombre;

                // Guardar cambios
                await _objetoTipoRepository.UpdateAsync(objetoTipoExistente);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el tipo de objeto con ID: {updateObjetoTipoDto?.Id}");
                throw;
            }
        }

        public async Task<bool> DeleteObjetoTipoAsync(int id)
        {
            try
            {
                // Validar que el tipo de objeto no esté siendo utilizado por algún objeto
                var objetoTipo = await _objetoTipoRepository.GetByIdAsync(id);
                if (objetoTipo == null)
                {
                    return false;
                }

                // Aquí podrías agregar validaciones adicionales, como verificar si hay objetos que usan este tipo
                // antes de permitir la eliminación

                await _objetoTipoRepository.DeleteAsync(objetoTipo);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el tipo de objeto con ID: {id}");
                throw;
            }
        }
    }
}