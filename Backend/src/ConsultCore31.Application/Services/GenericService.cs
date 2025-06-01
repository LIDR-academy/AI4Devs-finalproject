using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ConsultCore31.Application.Interfaces;
using ConsultCore31.Core.Common;
using ConsultCore31.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace ConsultCore31.Application.Services
{
    /// <summary>
    /// Implementación genérica de servicio CRUD
    /// </summary>
    /// <typeparam name="TDto">Tipo del DTO de respuesta</typeparam>
    /// <typeparam name="TCreateDto">Tipo del DTO para crear</typeparam>
    /// <typeparam name="TUpdateDto">Tipo del DTO para actualizar</typeparam>
    /// <typeparam name="TKey">Tipo de la clave primaria</typeparam>
    public abstract class GenericService<TDto, TCreateDto, TUpdateDto, TKey> : 
        IGenericService<TDto, TCreateDto, TUpdateDto, TKey> 
        where TKey : IEquatable<TKey>
    {
        protected readonly IMapper _mapper;
        protected readonly ILogger<GenericService<TDto, TCreateDto, TUpdateDto, TKey>> _logger;

        protected GenericService(
            IMapper mapper,
            ILogger<GenericService<TDto, TCreateDto, TUpdateDto, TKey>> logger)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public virtual async Task<IEnumerable<TDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException("Este método debe ser implementado por las clases derivadas");
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public virtual async Task<TDto> GetByIdAsync(TKey id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Obteniendo entidad con ID: {id}");
            throw new NotImplementedException("Este método debe ser implementado por las clases derivadas");
        }

        /// <summary>
        /// Crea una nueva entidad
        /// </summary>
        public virtual async Task<TDto> CreateAsync(TCreateDto createDto, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException("Este método debe ser implementado por las clases derivadas");
        }

        /// <summary>
        /// Actualiza una entidad existente
        /// </summary>
        public virtual async Task<bool> UpdateAsync(TUpdateDto updateDto, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException("Este método debe ser implementado por las clases derivadas");
        }

        /// <summary>
        /// Elimina una entidad por su ID (borrado lógico)
        /// </summary>
        public virtual async Task<bool> DeleteAsync(TKey id, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Eliminando entidad con ID: {id}");
            throw new NotImplementedException("Este método debe ser implementado por las clases derivadas");
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public virtual async Task<bool> ExistsAsync(TKey id, CancellationToken cancellationToken = default)
        {
            throw new NotImplementedException("Este método debe ser implementado por las clases derivadas");
        }

        /// <summary>
        /// Obtiene el ID de la entidad desde el DTO de actualización
        /// </summary>
        protected abstract TKey GetIdFromUpdateDto(TUpdateDto updateDto);
    }
}
