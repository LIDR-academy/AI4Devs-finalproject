using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.Proyecto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad Proyecto
    /// </summary>
    public class ProyectoService : GenericService<ProyectoDto, CreateProyectoDto, UpdateProyectoDto, int>, IProyectoService
    {
        private readonly IProyectoRepository _proyectoRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        public ProyectoService(
            IProyectoRepository proyectoRepository,
            IMapper mapper,
            ILogger<ProyectoService> logger)
            : base(mapper, logger)
        {
            _proyectoRepository = proyectoRepository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<ProyectoDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _proyectoRepository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<ProyectoDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<ProyectoDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo proyecto con ID: {id}");
            var entity = await _proyectoRepository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<ProyectoDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<ProyectoDto> CreateAsync(CreateProyectoDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<Proyecto>(createDto);
            var createdEntity = await _proyectoRepository.AddAsync(entity, cancellationToken);
            return _mapper.Map<ProyectoDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateProyectoDto updateDto, CancellationToken cancellationToken = default)
        {
            var id = GetIdFromUpdateDto(updateDto);
            var existingEntity = await _proyectoRepository.GetByIdAsync(id, cancellationToken);
            
            if (existingEntity == null)
            {
                return false;
            }

            _mapper.Map(updateDto, existingEntity);
            await _proyectoRepository.UpdateAsync(existingEntity, cancellationToken);
            return true;
        }

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        public override async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Eliminando proyecto con ID: {id}");
            return await _proyectoRepository.SoftDeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public override async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _proyectoRepository.ExistsAsync(id, cancellationToken);
        }

        /// <summary>
        /// Obtiene el ID desde el DTO de actualización
        /// </summary>
        protected override int GetIdFromUpdateDto(UpdateProyectoDto updateDto)
        {
            return updateDto.Id;
        }

        // Aquí se pueden implementar métodos específicos para el servicio de Proyecto
    }
}
