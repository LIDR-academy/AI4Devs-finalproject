using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.EstadoAprobacion;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad EstadoAprobacion
    /// </summary>
    public class EstadoAprobacionService : GenericService<EstadoAprobacionDto, CreateEstadoAprobacionDto, UpdateEstadoAprobacionDto, int>, IEstadoAprobacionService
    {
        private readonly IGenericRepository<EstadoAprobacion, int> _repository;

        /// <summary>
        /// Constructor que inicializa el servicio con el repositorio, el mapper y el logger
        /// </summary>
        /// <param name="repository">Repositorio genérico para EstadoAprobacion</param>
        /// <param name="mapper">Instancia de AutoMapper</param>
        /// <param name="logger">Instancia del logger</param>
        public EstadoAprobacionService(
            IGenericRepository<EstadoAprobacion, int> repository, 
            IMapper mapper,
            ILogger<EstadoAprobacionService> logger)
            : base(mapper, logger)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<EstadoAprobacionDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _repository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<EstadoAprobacionDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<EstadoAprobacionDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo estado de aprobación con ID: {id}");
            var entity = await _repository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<EstadoAprobacionDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<EstadoAprobacionDto> CreateAsync(CreateEstadoAprobacionDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<EstadoAprobacion>(createDto);
            var createdEntity = await _repository.AddAsync(entity, cancellationToken);
            return _mapper.Map<EstadoAprobacionDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateEstadoAprobacionDto updateDto, CancellationToken cancellationToken = default)
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
            _logger.LogInformation($"Eliminando estado de aprobación con ID: {id}");
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
        /// <returns>ID del estado de aprobación</returns>
        protected override int GetIdFromUpdateDto(UpdateEstadoAprobacionDto updateDto)
        {
            return updateDto.Id;
        }
    }
}
