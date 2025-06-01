using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.Perfil;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio de Perfil
    /// </summary>
    public class PerfilService : IPerfilService
    {
        private readonly IPerfilRepository _perfilRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PerfilService> _logger;

        public PerfilService(
            IPerfilRepository perfilRepository,
            IMapper mapper,
            ILogger<PerfilService> logger)
        {
            _perfilRepository = perfilRepository ?? throw new ArgumentNullException(nameof(perfilRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<PerfilDto>> GetAllPerfilesAsync()
        {
            try
            {
                var perfiles = await _perfilRepository.ListAllAsync();
                return _mapper.Map<IEnumerable<PerfilDto>>(perfiles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los perfiles");
                throw;
            }
        }

        public async Task<PerfilDto> GetPerfilByIdAsync(int id)
        {
            try
            {
                var perfil = await _perfilRepository.GetByIdAsync(id);
                return _mapper.Map<PerfilDto>(perfil);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el perfil con ID: {id}");
                throw;
            }
        }

        public async Task<PerfilDto> CreatePerfilAsync(CreatePerfilDto createPerfilDto)
        {
            try
            {
                // Validar que no exista un perfil con el mismo nombre
                if (await _perfilRepository.ExistsByNombreAsync(createPerfilDto.Nombre))
                {
                    throw new InvalidOperationException("Ya existe un perfil con el nombre proporcionado.");
                }

                var perfil = _mapper.Map<Perfil>(createPerfilDto);
                var perfilCreado = await _perfilRepository.AddAsync(perfil);
                return _mapper.Map<PerfilDto>(perfilCreado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el perfil");
                throw;
            }
        }

        public async Task<bool> UpdatePerfilAsync(UpdatePerfilDto updatePerfilDto)
        {
            try
            {
                // Validar que el perfil exista
                var perfilExistente = await _perfilRepository.GetByIdAsync(updatePerfilDto.Id);
                if (perfilExistente == null)
                {
                    return false;
                }

                // Validar que no exista otro perfil con el mismo nombre
                if (await _perfilRepository.ExistsByNombreAsync(updatePerfilDto.Nombre, updatePerfilDto.Id))
                {
                    throw new InvalidOperationException("Ya existe otro perfil con el nombre proporcionado.");
                }

                // Actualizar propiedades
                perfilExistente.PerfilNombre = updatePerfilDto.Nombre;
                perfilExistente.PerfilActivo = updatePerfilDto.Activo;

                // Guardar cambios
                await _perfilRepository.UpdateAsync(perfilExistente);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el perfil con ID: {updatePerfilDto?.Id}");
                throw;
            }
        }

        public async Task<bool> DeletePerfilAsync(int id)
        {
            try
            {
                var perfil = await _perfilRepository.GetByIdAsync(id);
                if (perfil == null)
                {
                    return false;
                }

                await _perfilRepository.DeleteAsync(perfil);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el perfil con ID: {id}");
                throw;
            }
        }
    }
}
