using AutoMapper;

using ConsultCore31.Application.DTOs.Cliente;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad Cliente
    /// </summary>
    public class ClienteService : GenericService<ClienteDto, CreateClienteDto, UpdateClienteDto, int>, IClienteService
    {
        private readonly IClienteRepository _clienteRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        public ClienteService(
            IClienteRepository clienteRepository,
            IMapper mapper,
            ILogger<ClienteService> logger)
            : base(mapper, logger)
        {
            _clienteRepository = clienteRepository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<ClienteDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _clienteRepository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<ClienteDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<ClienteDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo cliente con ID: {id}");
            var entity = await _clienteRepository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<ClienteDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<ClienteDto> CreateAsync(CreateClienteDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<Cliente>(createDto);
            var createdEntity = await _clienteRepository.AddAsync(entity, cancellationToken);
            return _mapper.Map<ClienteDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateClienteDto updateDto, CancellationToken cancellationToken = default)
        {
            var id = GetIdFromUpdateDto(updateDto);
            var existingEntity = await _clienteRepository.GetByIdAsync(id, cancellationToken);

            if (existingEntity == null)
            {
                return false;
            }

            _mapper.Map(updateDto, existingEntity);
            await _clienteRepository.UpdateAsync(existingEntity, cancellationToken);
            return true;
        }

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        public override async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Eliminando cliente con ID: {id}");
            return await _clienteRepository.SoftDeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public override async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _clienteRepository.ExistsAsync(id, cancellationToken);
        }

        /// <summary>
        /// Obtiene el ID desde el DTO de actualización
        /// </summary>
        protected override int GetIdFromUpdateDto(UpdateClienteDto updateDto)
        {
            return updateDto.Id;
        }

        // Aquí se pueden implementar métodos específicos para el servicio de Cliente
    }
}