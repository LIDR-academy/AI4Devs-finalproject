using AutoMapper;

using ConsultCore31.Application.DTOs.ComentarioTarea;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad ComentarioTarea
    /// </summary>
    public class ComentarioTareaService : GenericService<ComentarioTareaDto, CreateComentarioTareaDto, UpdateComentarioTareaDto, int>, IComentarioTareaService
    {
        private readonly IComentarioTareaRepository _comentarioTareaRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        public ComentarioTareaService(
            IComentarioTareaRepository comentarioTareaRepository,
            IMapper mapper,
            ILogger<ComentarioTareaService> logger)
            : base(mapper, logger)
        {
            _comentarioTareaRepository = comentarioTareaRepository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<ComentarioTareaDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _comentarioTareaRepository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<ComentarioTareaDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<ComentarioTareaDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo comentario de tarea con ID: {id}");
            var entity = await _comentarioTareaRepository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<ComentarioTareaDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<ComentarioTareaDto> CreateAsync(CreateComentarioTareaDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<ComentarioTarea>(createDto);
            var createdEntity = await _comentarioTareaRepository.AddAsync(entity, cancellationToken);
            return _mapper.Map<ComentarioTareaDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateComentarioTareaDto updateDto, CancellationToken cancellationToken = default)
        {
            var id = GetIdFromUpdateDto(updateDto);
            var existingEntity = await _comentarioTareaRepository.GetByIdAsync(id, cancellationToken);

            if (existingEntity == null)
            {
                return false;
            }

            _mapper.Map(updateDto, existingEntity);
            await _comentarioTareaRepository.UpdateAsync(existingEntity, cancellationToken);
            return true;
        }

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        public override async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Eliminando comentario de tarea con ID: {id}");
            return await _comentarioTareaRepository.SoftDeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public override async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _comentarioTareaRepository.ExistsAsync(id, cancellationToken);
        }

        /// <summary>
        /// Obtiene el ID desde el DTO de actualización
        /// </summary>
        protected override int GetIdFromUpdateDto(UpdateComentarioTareaDto updateDto)
        {
            return updateDto.Id;
        }

        // Aquí se pueden implementar métodos específicos para el servicio de ComentarioTarea
    }
}