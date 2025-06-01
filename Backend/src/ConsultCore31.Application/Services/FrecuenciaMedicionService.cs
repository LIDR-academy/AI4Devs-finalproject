using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.FrecuenciaMedicion;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad FrecuenciaMedicion
    /// </summary>
    public class FrecuenciaMedicionService : GenericService<FrecuenciaMedicionDto, CreateFrecuenciaMedicionDto, UpdateFrecuenciaMedicionDto, int>, IFrecuenciaMedicionService
    {
        private readonly IGenericRepository<FrecuenciaMedicion, int> _repository;

        /// <summary>
        /// Constructor que inicializa el servicio con el repositorio, el mapper y el logger
        /// </summary>
        /// <param name="repository">Repositorio genérico para FrecuenciaMedicion</param>
        /// <param name="mapper">Instancia de AutoMapper</param>
        /// <param name="logger">Instancia del logger</param>
        public FrecuenciaMedicionService(
            IGenericRepository<FrecuenciaMedicion, int> repository, 
            IMapper mapper,
            ILogger<FrecuenciaMedicionService> logger)
            : base(mapper, logger)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<FrecuenciaMedicionDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _repository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<FrecuenciaMedicionDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<FrecuenciaMedicionDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo frecuencia de medición con ID: {id}");
            var entity = await _repository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<FrecuenciaMedicionDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<FrecuenciaMedicionDto> CreateAsync(CreateFrecuenciaMedicionDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<FrecuenciaMedicion>(createDto);
            var createdEntity = await _repository.AddAsync(entity, cancellationToken);
            return _mapper.Map<FrecuenciaMedicionDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateFrecuenciaMedicionDto updateDto, CancellationToken cancellationToken = default)
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
            _logger.LogInformation($"Eliminando frecuencia de medición con ID: {id}");
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
        /// <returns>ID de la frecuencia de medición</returns>
        protected override int GetIdFromUpdateDto(UpdateFrecuenciaMedicionDto updateDto)
        {
            return updateDto.Id;
        }
    }
}
