using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.Tarea;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad Tarea
    /// </summary>
    public class TareaService : GenericService<TareaDto, CreateTareaDto, UpdateTareaDto, int>, ITareaService
    {
        private readonly ITareaRepository _tareaRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        public TareaService(
            ITareaRepository tareaRepository,
            IMapper mapper,
            ILogger<TareaService> logger)
            : base(mapper, logger)
        {
            _tareaRepository = tareaRepository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<TareaDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _tareaRepository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<TareaDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<TareaDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo tarea con ID: {id}");
            var entity = await _tareaRepository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<TareaDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<TareaDto> CreateAsync(CreateTareaDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<Tarea>(createDto);
            var createdEntity = await _tareaRepository.AddAsync(entity, cancellationToken);
            return _mapper.Map<TareaDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateTareaDto updateDto, CancellationToken cancellationToken = default)
        {
            var id = GetIdFromUpdateDto(updateDto);
            var existingEntity = await _tareaRepository.GetByIdAsync(id, cancellationToken);
            
            if (existingEntity == null)
            {
                return false;
            }

            _mapper.Map(updateDto, existingEntity);
            await _tareaRepository.UpdateAsync(existingEntity, cancellationToken);
            return true;
        }

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        public override async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Eliminando tarea con ID: {id}");
            return await _tareaRepository.SoftDeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public override async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _tareaRepository.ExistsAsync(id, cancellationToken);
        }

        /// <summary>
        /// Obtiene el ID desde el DTO de actualización
        /// </summary>
        protected override int GetIdFromUpdateDto(UpdateTareaDto updateDto)
        {
            return updateDto.Id;
        }

        // Aquí se pueden implementar métodos específicos para el servicio de Tarea
    }
}
