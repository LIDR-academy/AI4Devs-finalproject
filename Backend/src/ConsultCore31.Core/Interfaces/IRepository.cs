using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Ardalis.Specification;

namespace ConsultCore31.Core.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<T> GetByIdAsync<TId>(TId id, CancellationToken cancellationToken = default) where TId : notnull;
        Task<IReadOnlyList<T>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<T>> ListAsync(Ardalis.Specification.ISpecification<T> spec, CancellationToken cancellationToken = default);
        Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
        Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
        Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
        Task<int> CountAsync(Ardalis.Specification.ISpecification<T> spec, CancellationToken cancellationToken = default);
        Task<T> FirstAsync(Ardalis.Specification.ISpecification<T> spec, CancellationToken cancellationToken = default);
        Task<T> FirstOrDefaultAsync(Ardalis.Specification.ISpecification<T> spec, CancellationToken cancellationToken = default);
    }

    public interface IReadRepository<T> where T : class
    {
        Task<T> GetByIdAsync<TId>(TId id, CancellationToken cancellationToken = default) where TId : notnull;
        Task<IReadOnlyList<T>> ListAllAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<T>> ListAsync(Ardalis.Specification.ISpecification<T> specification, CancellationToken cancellationToken = default);
        Task<int> CountAsync(Ardalis.Specification.ISpecification<T> specification, CancellationToken cancellationToken = default);
        Task<T> FirstAsync(Ardalis.Specification.ISpecification<T> specification, CancellationToken cancellationToken = default);
        Task<T> FirstOrDefaultAsync(Ardalis.Specification.ISpecification<T> specification, CancellationToken cancellationToken = default);
    }

    public interface IUnitOfWork : IDisposable
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default);
    }
}
