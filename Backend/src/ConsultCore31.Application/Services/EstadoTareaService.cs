using AutoMapper;

using ConsultCore31.Application.DTOs.EstadoTarea;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad EstadoTarea
    /// </summary>
    public class EstadoTareaService : GenericService<EstadoTareaDto, CreateEstadoTareaDto, UpdateEstadoTareaDto, int>, IEstadoTareaService
    {
        private readonly IGenericRepository<EstadoTarea, int> _repository;

        /// <summary>
        /// Constructor que inicializa el servicio con el repositorio, el mapper y el logger
        /// </summary>
        /// <param name="repository">Repositorio genérico para EstadoTarea</param>
        /// <param name="mapper">Instancia de AutoMapper</param>
        /// <param name="logger">Instancia del logger</param>
        public EstadoTareaService(
            IGenericRepository<EstadoTarea, int> repository,
            IMapper mapper,
            ILogger<EstadoTareaService> logger)
            : base(mapper, logger)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<EstadoTareaDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _repository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<EstadoTareaDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<EstadoTareaDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            if (_logger != null)
            {
                _logger.LogInformation($"Obteniendo estado de tarea con ID: {id}");
            }
            var entity = await _repository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<EstadoTareaDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<EstadoTareaDto> CreateAsync(CreateEstadoTareaDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<EstadoTarea>(createDto);
            var createdEntity = await _repository.AddAsync(entity, cancellationToken);
            return _mapper.Map<EstadoTareaDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateEstadoTareaDto updateDto, CancellationToken cancellationToken = default)
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
            if (_logger != null)
            {
                _logger.LogInformation($"Eliminando estado de tarea con ID: {id}");
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
        /// <returns>ID del estado de tarea</returns>
        protected override int GetIdFromUpdateDto(UpdateEstadoTareaDto updateDto)
        {
            return updateDto.Id;
        }
    }
}