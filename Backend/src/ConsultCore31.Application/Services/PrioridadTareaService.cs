using AutoMapper;

using ConsultCore31.Application.DTOs.PrioridadTarea;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad PrioridadTarea
    /// </summary>
    public class PrioridadTareaService : GenericService<PrioridadTareaDto, CreatePrioridadTareaDto, UpdatePrioridadTareaDto, int>, IPrioridadTareaService
    {
        private readonly IGenericRepository<PrioridadTarea, int> _repository;

        /// <summary>
        /// Constructor que inicializa el servicio con el repositorio, el mapper y el logger
        /// </summary>
        /// <param name="repository">Repositorio genérico para PrioridadTarea</param>
        /// <param name="mapper">Instancia de AutoMapper</param>
        /// <param name="logger">Instancia del logger</param>
        public PrioridadTareaService(IGenericRepository<PrioridadTarea, int> repository, IMapper mapper, ILogger<PrioridadTareaService> logger) : base(mapper, logger)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todos los prioridades de tarea, con opción de incluir inactivos
        /// </summary>
        /// <param name="includeInactive">Si es true, incluye también los prioridades de tarea inactivos</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de prioridades de tarea</returns>
        public async Task<IEnumerable<PrioridadTareaDto>> GetAllWithInactiveAsync(bool includeInactive = false, CancellationToken cancellationToken = default)
        {
            try
            {
                var prioridadesTarea = includeInactive
                    ? await _repository.GetAllAsync(cancellationToken)
                    : await _repository.GetAllActiveAsync(cancellationToken);
                    
                return _mapper.Map<IEnumerable<PrioridadTareaDto>>(prioridadesTarea);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener prioridades de tarea con includeInactive={includeInactive}");
                throw;
            }
        }

        /// <summary>
        /// Obtiene todas las prioridades de tarea activas
        /// </summary>
        public override async Task<IEnumerable<PrioridadTareaDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _repository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<PrioridadTareaDto>>(entities);
        }

        /// <summary>
        /// Obtiene una prioridad de tarea por su ID
        /// </summary>
        public override async Task<PrioridadTareaDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo prioridad de tarea con ID: {id}");
            var entity = await _repository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<PrioridadTareaDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva prioridad de tarea
        /// </summary>
        public override async Task<PrioridadTareaDto> CreateAsync(CreatePrioridadTareaDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<PrioridadTarea>(createDto);
            var createdEntity = await _repository.AddAsync(entity, cancellationToken);
            return _mapper.Map<PrioridadTareaDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una prioridad de tarea existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdatePrioridadTareaDto updateDto, CancellationToken cancellationToken = default)
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
        /// Elimina una prioridad de tarea por su ID (borrado lógico)
        /// </summary>
        public override async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Eliminando prioridad de tarea con ID: {id}");
            return await _repository.SoftDeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Verifica si existe una prioridad de tarea con el ID especificado
        /// </summary>
        public override async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _repository.ExistsAsync(id, cancellationToken);
        }

        /// <summary>
        /// Obtiene el ID del DTO de actualización
        /// </summary>
        /// <param name="updateDto">DTO de actualización</param>
        /// <returns>ID de la prioridad de tarea</returns>
        protected override int GetIdFromUpdateDto(UpdatePrioridadTareaDto updateDto)
        {
            return updateDto.Id;
        }
    }
}