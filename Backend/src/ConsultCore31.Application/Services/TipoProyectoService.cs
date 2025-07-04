using AutoMapper;

using ConsultCore31.Application.DTOs.TipoProyecto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad TipoProyecto
    /// </summary>
    public class TipoProyectoService : GenericService<TipoProyectoDto, CreateTipoProyectoDto, UpdateTipoProyectoDto, int>, ITipoProyectoService
    {
        private readonly IGenericRepository<TipoProyecto, int> _repository;

        /// <summary>
        /// Constructor que inicializa el servicio con el repositorio, el mapper y el logger
        /// </summary>
        /// <param name="repository">Repositorio genérico para TipoProyecto</param>
        /// <param name="mapper">Instancia de AutoMapper</param>
        /// <param name="logger">Instancia del logger</param>
        public TipoProyectoService(IGenericRepository<TipoProyecto, int> repository, IMapper mapper, ILogger<TipoProyectoService> logger) : base(mapper, logger)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<TipoProyectoDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _repository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<TipoProyectoDto>>(entities);
        }

        /// <summary>
        /// Obtiene todos los tipos de proyecto, incluyendo los inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los tipos inactivos</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de tipos de proyecto</returns>
        public async Task<IEnumerable<TipoProyectoDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
        {
            var entities = includeInactive
                ? await _repository.GetAllAsync(cancellationToken)
                : await _repository.GetAllActiveAsync(cancellationToken);
                
            return _mapper.Map<IEnumerable<TipoProyectoDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<TipoProyectoDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo tipo de proyecto con ID: {id}");
            var entity = await _repository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<TipoProyectoDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<TipoProyectoDto> CreateAsync(CreateTipoProyectoDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<TipoProyecto>(createDto);
            var createdEntity = await _repository.AddAsync(entity, cancellationToken);
            return _mapper.Map<TipoProyectoDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateTipoProyectoDto updateDto, CancellationToken cancellationToken = default)
        {
            var id = GetIdFromUpdateDto(updateDto);
            var existingEntity = await _repository.GetByIdAsync(id, cancellationToken);

            if (existingEntity == null)
            {
                return false;
            }

            _mapper.Map(updateDto, existingEntity);
            await _repository.UpdateAsync(existingEntity, cancellationToken);
            return true;
        }

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        public override async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Eliminando tipo de proyecto con ID: {id}");
            return await _repository.SoftDeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public override async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _repository.ExistsAsync(id, cancellationToken);
        }

        /// <summary>
        /// Obtiene el ID del DTO de actualización
        /// </summary>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>ID del tipo de proyecto</returns>
        protected override int GetIdFromUpdateDto(UpdateTipoProyectoDto updateDto)
        {
            return updateDto.Id;
        }        
    }
}