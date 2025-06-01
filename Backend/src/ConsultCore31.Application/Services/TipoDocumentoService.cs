using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.DTOs.TipoDocumento;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación del servicio para la entidad TipoDocumento
    /// </summary>
    public class TipoDocumentoService : GenericService<TipoDocumentoDto, CreateTipoDocumentoDto, UpdateTipoDocumentoDto, int>, ITipoDocumentoService
    {
        private readonly IGenericRepository<TipoDocumento, int> _repository;

        /// <summary>
        /// Constructor que inicializa el servicio con el repositorio, el mapper y el logger
        /// </summary>
        /// <param name="repository">Repositorio genérico para TipoDocumento</param>
        /// <param name="mapper">Instancia de AutoMapper</param>
        /// <param name="logger">Instancia del logger</param>
        public TipoDocumentoService(
            IGenericRepository<TipoDocumento, int> repository, 
            IMapper mapper,
            ILogger<TipoDocumentoService> logger)
            : base(mapper, logger)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public override async Task<IEnumerable<TipoDocumentoDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _repository.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<TipoDocumentoDto>>(entities);
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public override async Task<TipoDocumentoDto> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo tipo de documento con ID: {id}");
            var entity = await _repository.GetByIdAsync(id, cancellationToken);
            return entity != null ? _mapper.Map<TipoDocumentoDto>(entity) : default;
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public override async Task<TipoDocumentoDto> CreateAsync(CreateTipoDocumentoDto createDto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<TipoDocumento>(createDto);
            var createdEntity = await _repository.AddAsync(entity, cancellationToken);
            return _mapper.Map<TipoDocumentoDto>(createdEntity);
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public override async Task<bool> UpdateAsync(UpdateTipoDocumentoDto updateDto, CancellationToken cancellationToken = default)
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
            _logger.LogInformation($"Eliminando tipo de documento con ID: {id}");
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
        /// <returns>ID del tipo de documento</returns>
        protected override int GetIdFromUpdateDto(UpdateTipoDocumentoDto updateDto)
        {
            return updateDto.Id;
        }
    }
}
