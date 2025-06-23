using AutoMapper;

using ConsultCore31.Application.DTOs.CategoriaGasto;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;

using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para categorías de gasto
    /// </summary>
    public class CategoriaGastoService : GenericService<CategoriaGastoDto, CreateCategoriaGastoDto, UpdateCategoriaGastoDto, int>, ICategoriaGastoService
    {
        private readonly ICategoriaGastoRepository _categoriaGastoRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        public CategoriaGastoService(
            ICategoriaGastoRepository categoriaGastoRepository,
            IMapper mapper,
            ILogger<CategoriaGastoService> logger) : base(mapper, logger)
        {
            _categoriaGastoRepository = categoriaGastoRepository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<CategoriaGastoDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _categoriaGastoRepository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<CategoriaGastoDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<CategoriaGastoDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo categoría de gasto con ID: {id}");
            var entity = await _categoriaGastoRepository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<CategoriaGastoDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<CategoriaGastoDto> CreateAsync(CreateCategoriaGastoDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<CategoriaGasto>(createDto);
            var createdEntity = await _categoriaGastoRepository.AddAsync(entity, cancellationToken);
            return _mapper.Map<CategoriaGastoDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateCategoriaGastoDto updateDto, CancellationToken cancellationToken = default)
        {
            var id = GetIdFromUpdateDto(updateDto);
            var existingEntity = await _categoriaGastoRepository.GetByIdAsync(id, cancellationToken);

            if (existingEntity == null)
            {
                return false;
            }

            _mapper.Map(updateDto, existingEntity);
            await _categoriaGastoRepository.UpdateAsync(existingEntity, cancellationToken);
            return true;
        }

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        public override async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Eliminando categoría de gasto con ID: {id}");
            return await _categoriaGastoRepository.SoftDeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public override async Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _categoriaGastoRepository.ExistsAsync(id, cancellationToken);
        }

        /// <summary>
        /// Obtiene el ID desde el DTO de actualización
        /// </summary>
        protected override int GetIdFromUpdateDto(UpdateCategoriaGastoDto updateDto)
        {
            return updateDto.Id;
        }

        // Implementación de métodos específicos para CategoriaGasto si son necesarios
    }
}