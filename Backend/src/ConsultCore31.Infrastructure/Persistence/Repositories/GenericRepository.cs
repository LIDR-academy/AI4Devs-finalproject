using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using Ardalis.Specification;

using ConsultCore31.Core.Common;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

using Microsoft.EntityFrameworkCore;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación genérica del repositorio para entidades
    /// </summary>
    /// <typeparam name="T">Tipo de entidad</typeparam>
    /// <typeparam name="TKey">Tipo de la clave primaria</typeparam>
    public class GenericRepository<T, TKey> : RepositoryBase<T>, IGenericRepository<T, TKey>
        where T : BaseEntity<TKey>
        where TKey : IEquatable<TKey>
    {
        protected readonly AppDbContext _appDbContext;

        public GenericRepository(AppDbContext dbContext) : base(dbContext)
        {
            _appDbContext = dbContext;
        }

        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        public async Task<T> GetByIdAsync(TKey id, CancellationToken cancellationToken = default)
        {
            return await _dbSet.FirstOrDefaultAsync(e => e.Id.Equals(id), cancellationToken);
        }

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        public async Task<bool> ExistsAsync(TKey id, CancellationToken cancellationToken = default)
        {
            return await _dbSet.AnyAsync(e => e.Id.Equals(id), cancellationToken);
        }

        /// <summary>
        /// Obtiene todas las entidades no eliminadas
        /// </summary>
        public async Task<IReadOnlyList<T>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.ToListAsync(cancellationToken);
        }

        /// <summary>
        /// Realiza un borrado lógico de la entidad
        /// </summary>
        public async Task<bool> SoftDeleteAsync(TKey id, CancellationToken cancellationToken = default)
        {
            var entity = await _dbSet.FirstOrDefaultAsync(e => e.Id.Equals(id), cancellationToken);
            if (entity == null)
            {
                return false;
            }

            // Como BaseEntity no tiene IsDeleted, actualizamos la fecha de modificación
            entity.FechaModificacion = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }

        /// <summary>
        /// Actualiza una entidad
        /// </summary>
        public override async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
        {
            entity.FechaModificacion = DateTime.UtcNow;
            _dbContext.Entry(entity).State = EntityState.Modified;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}