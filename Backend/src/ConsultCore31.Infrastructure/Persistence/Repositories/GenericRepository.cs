using ConsultCore31.Core.Common;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

using System.Linq.Expressions;

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
        /// Obtiene todas las entidades, tanto activas como inactivas
        /// </summary>
        public virtual async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet.ToListAsync(cancellationToken);
        }

        /// <summary>
        /// Obtiene todas las entidades activas
        /// </summary>
        public virtual async Task<IReadOnlyList<T>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        {
            // Verificar si el tipo T tiene una propiedad Activo
            var propertyInfo = typeof(T).GetProperty("Activo");
            
            if (propertyInfo != null && propertyInfo.PropertyType == typeof(bool))
            {
                // Filtrar por la propiedad Activo = true usando expresiones dinámicas
                var parameter = Expression.Parameter(typeof(T), "e");
                var property = Expression.Property(parameter, propertyInfo);
                var trueValue = Expression.Constant(true);
                var equalExpr = Expression.Equal(property, trueValue);
                var lambda = Expression.Lambda<Func<T, bool>>(equalExpr, parameter);
                
                return await _dbSet.Where(lambda).ToListAsync(cancellationToken);
            }
            
            // Si no tiene la propiedad Activo, devolver todas las entidades
            return await _dbSet.ToListAsync(cancellationToken);
        }

        /// <summary>
        /// Realiza un borrado lógico de la entidad
        /// </summary>
        public virtual async Task<bool> SoftDeleteAsync(TKey id, CancellationToken cancellationToken = default)
        {
            var entity = await _dbSet.FirstOrDefaultAsync(e => e.Id.Equals(id), cancellationToken);
            if (entity == null)
            {
                return false;
            }
            
            // Verificar si la entidad tiene una propiedad Activo y establecerla a false
            var activoProperty = entity.GetType().GetProperty("Activo");
            if (activoProperty != null && activoProperty.PropertyType == typeof(bool))
            {
                activoProperty.SetValue(entity, false);
            }
            
            // Actualizar la fecha de modificación
            entity.FechaModificacion = DateTime.UtcNow;
            
            _dbContext.Entry(entity).State = EntityState.Modified;
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