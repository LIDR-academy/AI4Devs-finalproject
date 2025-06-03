using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.EstadoProyecto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad EstadoProyecto
    /// </summary>
    public class EstadoProyectoService : GenericService<EstadoProyectoDto, CreateEstadoProyectoDto, UpdateEstadoProyectoDto, int>, IEstadoProyectoService
    {
        private readonly IGenericRepository<EstadoProyecto, int> _repository;

        /// <summary>
        /// Constructor que inicializa el servicio con el repositorio, el mapper y el logger
        /// </summary>
        /// <param name="repository">Repositorio genérico para EstadoProyecto</param>
        /// <param name="mapper">Instancia de AutoMapper</param>
        /// <param name="logger">Instancia del logger</param>
        public EstadoProyectoService(
            IGenericRepository<EstadoProyecto, int> repository, 
            IMapper mapper,
            ILogger<EstadoProyectoService> logger)
            : base(mapper, logger)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<EstadoProyectoDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _repository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<EstadoProyectoDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<EstadoProyectoDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo estado de proyecto con ID: {id}");
            var entity = await _repository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<EstadoProyectoDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<EstadoProyectoDto> CreateAsync(CreateEstadoProyectoDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<EstadoProyecto>(createDto);
            var createdEntity = await _repository.AddAsync(entity, cancellationToken);
            return _mapper.Map<EstadoProyectoDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateEstadoProyectoDto updateDto, CancellationToken cancellationToken = default)
        {
            var id = GetIdFromUpdateDto(updateDto);
            var existingEntity = await _repository.GetByIdAsync(id, cancellationToken);
            
            if (existingEntity == null)
            {
                throw new KeyNotFoundException($"No se encontró el estado de proyecto con ID: {id}");
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
            _logger.LogInformation($"Eliminando estado de proyecto con ID: {id}");
            var existingEntity = await _repository.GetByIdAsync(id, cancellationToken);
            
            if (existingEntity == null)
            {
                throw new KeyNotFoundException($"No se encontró el estado de proyecto con ID: {id}");
            }
            
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
        /// <returns>ID del estado de proyecto</returns>
        protected override int GetIdFromUpdateDto(UpdateEstadoProyectoDto updateDto)
        {
            return updateDto.Id;
        }
    }
}
