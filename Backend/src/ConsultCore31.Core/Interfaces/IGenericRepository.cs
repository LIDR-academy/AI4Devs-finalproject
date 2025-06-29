using ConsultCore31.Core.Common;

namespace ConsultCore31.Core.Interfaces
{
    /// <summary>
    /// Interfaz genérica para repositorios de entidades
    /// </summary>
    /// <typeparam name="T">Tipo de entidad</typeparam>
    /// <typeparam name="TKey">Tipo de la clave primaria</typeparam>
    public interface IGenericRepository<T, TKey> : IRepository<T>
        where T : BaseEntity<TKey>
        where TKey : IEquatable<TKey>
    {
        /// <summary>
        /// Obtiene una entidad por su ID
        /// </summary>
        Task<T> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Verifica si existe una entidad con el ID especificado
        /// </summary>
        Task<bool> ExistsAsync(TKey id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Obtiene todas las entidades no eliminadas
        /// </summary>
        Task<IReadOnlyList<T>> GetAllActiveAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Obtiene todas las entidades, tanto activas como inactivas
        /// </summary>
        Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Realiza un borrado lógico de la entidad
        /// </summary>
        Task<bool> SoftDeleteAsync(TKey id, CancellationToken cancellationToken = default);
    }
}