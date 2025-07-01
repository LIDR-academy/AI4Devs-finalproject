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
    public class PerfilService : GenericService<PerfilDto, CreatePerfilDto, UpdatePerfilDto, int>, IPerfilService
    {
        private readonly IPerfilRepository _perfilRepository;

        /// <summary>
        /// Constructor que inicializa el servicio con el repositorio, el mapper y el logger
        /// </summary>
        /// <param name="perfilRepository">Repositorio de perfiles</param>
        /// <param name="mapper">Instancia de AutoMapper</param>
        /// <param name="logger">Instancia del logger</param>
        public PerfilService(
            IPerfilRepository perfilRepository,
            IMapper mapper,
            ILogger<PerfilService> logger)
            : base(mapper, logger)
        {
            _perfilRepository = perfilRepository ?? throw new ArgumentNullException(nameof(perfilRepository));
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<PerfilDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var perfiles = await _perfilRepository.GetAllActiveAsync(cancellationToken);
                return _mapper.Map<IEnumerable<PerfilDto>>(perfiles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todos los perfiles activos");
                throw;
            }
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<PerfilDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation($"Obteniendo perfil con ID: {id}");
                var perfil = await _perfilRepository.GetByIdAsync(id, cancellationToken);
                return perfil != null ? _mapper.Map<PerfilDto>(perfil) : default;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el perfil con ID: {id}");
                throw;
            }
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<PerfilDto> CreateAsync(CreatePerfilDto createDto, CancellationToken cancellationToken = default)
        {
            try
            {
                // Validar que no exista un perfil con el mismo nombre
                if (await _perfilRepository.ExistsByNombreAsync(createDto.Nombre, null, cancellationToken))
                {
                    throw new InvalidOperationException("Ya existe un perfil con el nombre proporcionado.");
                }

                var perfil = _mapper.Map<Perfil>(createDto);
                var perfilCreado = await _perfilRepository.AddAsync(perfil, cancellationToken);
                return _mapper.Map<PerfilDto>(perfilCreado);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el perfil");
                throw;
            }
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdatePerfilDto updateDto, CancellationToken cancellationToken = default)
        {
            try
            {
                var id = GetIdFromUpdateDto(updateDto);
                
                // Validar que el perfil exista
                var perfilExistente = await _perfilRepository.GetByIdAsync(id, cancellationToken);
                if (perfilExistente == null)
                {
                    return false;
                }

                // Validar que no exista otro perfil con el mismo nombre
                if (await _perfilRepository.ExistsByNombreAsync(updateDto.Nombre, id, cancellationToken))
                {
                    throw new InvalidOperationException("Ya existe otro perfil con el nombre proporcionado.");
                }

                // Actualizar propiedades
                _mapper.Map(updateDto, perfilExistente);
                
                // Guardar cambios
                await _perfilRepository.UpdateAsync(perfilExistente, cancellationToken);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al actualizar el perfil con ID: {updateDto?.Id}");
                throw;
            }
        }

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        public override async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation($"Eliminando perfil con ID: {id}");
                return await _perfilRepository.SoftDeleteAsync(id, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al eliminar el perfil con ID: {id}");
                throw;
            }
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public override async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _perfilRepository.ExistsAsync(id, cancellationToken);
        }

        /// <summary>
        /// Obtiene el ID del DTO de actualización
        /// </summary>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>ID del perfil</returns>
        protected override int GetIdFromUpdateDto(UpdatePerfilDto updateDto)
        {
            return updateDto.Id;
        }

        /// <summary>
        /// Obtiene todos los perfiles, con opción de incluir inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los perfiles inactivos</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de perfiles</returns>
        public async Task<IEnumerable<PerfilDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var perfiles = includeInactive
                    ? await _perfilRepository.GetAllAsync(cancellationToken)
                    : await _perfilRepository.GetAllActiveAsync(cancellationToken);
                    
                return _mapper.Map<IEnumerable<PerfilDto>>(perfiles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener perfiles con includeInactive={includeInactive}");
                throw;
            }
        }
        
        /// <summary>
        /// Obtiene un perfil por su ID con información detallada
        /// </summary>
        /// <param name="id">ID del perfil</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>DTO del perfil</returns>
        public async Task<PerfilDto> GetPerfilByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation($"Obteniendo perfil detallado con ID: {id}");
                
                // Obtener el perfil con sus relaciones
                var perfil = await _perfilRepository.GetPerfilConRelacionesAsync(id, cancellationToken);
                
                if (perfil == null)
                {
                    _logger.LogWarning($"No se encontró el perfil con ID: {id}");
                    return null;
                }
                
                return _mapper.Map<PerfilDto>(perfil);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener el perfil detallado con ID: {id}");
                throw;
            }
        }
    }
}