using AutoMapper;

using ConsultCore31.Application.DTOs.EtapaProyecto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad EtapaProyecto
    /// </summary>
    public class EtapaProyectoService : GenericService<EtapaProyectoDto, CreateEtapaProyectoDto, UpdateEtapaProyectoDto, int>, IEtapaProyectoService
    {
        private readonly IEtapaProyectoRepository _etapaProyectoRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        public EtapaProyectoService(
            IEtapaProyectoRepository etapaProyectoRepository,
            IMapper mapper,
            ILogger<EtapaProyectoService> logger)
            : base(mapper, logger)
        {
            _etapaProyectoRepository = etapaProyectoRepository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<EtapaProyectoDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _etapaProyectoRepository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<EtapaProyectoDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<EtapaProyectoDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo etapa de proyecto con ID: {id}");
            var entity = await _etapaProyectoRepository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<EtapaProyectoDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<EtapaProyectoDto> CreateAsync(CreateEtapaProyectoDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<EtapaProyecto>(createDto);
            var createdEntity = await _etapaProyectoRepository.AddAsync(entity, cancellationToken);
            return _mapper.Map<EtapaProyectoDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateEtapaProyectoDto updateDto, CancellationToken cancellationToken = default)
        {
            var id = GetIdFromUpdateDto(updateDto);
            var existingEntity = await _etapaProyectoRepository.GetByIdAsync(id, cancellationToken);

            if (existingEntity == null)
            {
                return false;
            }

            _mapper.Map(updateDto, existingEntity);
            await _etapaProyectoRepository.UpdateAsync(existingEntity, cancellationToken);
            return true;
        }

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        public override async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Eliminando etapa de proyecto con ID: {id}");
            return await _etapaProyectoRepository.SoftDeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public override async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _etapaProyectoRepository.ExistsAsync(id, cancellationToken);
        }

        /// <summary>
        /// Obtiene el ID desde el DTO de actualización
        /// </summary>
        protected override int GetIdFromUpdateDto(UpdateEtapaProyectoDto updateDto)
        {
            return updateDto.Id;
        }

        // Aquí se pueden implementar métodos específicos para el servicio de EtapaProyecto
    }
}