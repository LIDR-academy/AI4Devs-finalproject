using AutoMapper;

using ConsultCore31.Application.DTOs.Empleado;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad Empleado
    /// </summary>
    public class EmpleadoService : GenericService<EmpleadoDto, CreateEmpleadoDto, UpdateEmpleadoDto, int>, IEmpleadoService
    {
        private readonly IEmpleadoRepository _empleadoRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        public EmpleadoService(
            IEmpleadoRepository empleadoRepository,
            IMapper mapper,
            ILogger<EmpleadoService> logger)
            : base(mapper, logger)
        {
            _empleadoRepository = empleadoRepository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<EmpleadoDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _empleadoRepository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<EmpleadoDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<EmpleadoDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo empleado con ID: {id}");
            var entity = await _empleadoRepository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<EmpleadoDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<EmpleadoDto> CreateAsync(CreateEmpleadoDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<Empleado>(createDto);
            var createdEntity = await _empleadoRepository.AddAsync(entity, cancellationToken);
            return _mapper.Map<EmpleadoDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateEmpleadoDto updateDto, CancellationToken cancellationToken = default)
        {
            var id = GetIdFromUpdateDto(updateDto);
            var existingEntity = await _empleadoRepository.GetByIdAsync(id, cancellationToken);

            if (existingEntity == null)
            {
                return false;
            }

            _mapper.Map(updateDto, existingEntity);
            await _empleadoRepository.UpdateAsync(existingEntity, cancellationToken);
            return true;
        }

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        public override async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Eliminando empleado con ID: {id}");
            return await _empleadoRepository.SoftDeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public override async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _empleadoRepository.ExistsAsync(id, cancellationToken);
        }

        /// <summary>
        /// Obtiene el ID desde el DTO de actualización
        /// </summary>
        protected override int GetIdFromUpdateDto(UpdateEmpleadoDto updateDto)
        {
            return updateDto.Id;
        }

        // Aquí se pueden implementar métodos específicos para el servicio de Empleado
    }
}