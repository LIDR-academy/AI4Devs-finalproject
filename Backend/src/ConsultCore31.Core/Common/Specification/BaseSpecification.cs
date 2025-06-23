using Ardalis.Specification;

using System.Linq.Expressions;

namespace ConsultCore31.Core.Common.Specification
{
    public abstract class BaseSpecification<T> : Specification<T>, ISpecification<T> where T : class
    {
        protected BaseSpecification()
        { }

        protected BaseSpecification(Expression<Func<T, bool>> criteria)
        {
            Query.Where(criteria);
        }

        // Métodos de conveniencia para aplicar filtros, ordenamiento, etc.
        protected virtual void ApplyOrderBy(Expression<Func<T, object?>> orderByExpression)
        {
            Query.OrderBy(orderByExpression);
        }

        protected virtual void ApplyOrderByDescending(Expression<Func<T, object?>> orderByDescendingExpression)
        {
            Query.OrderByDescending(orderByDescendingExpression);
        }

        protected virtual void ApplyPaging(int skip, int take)
        {
            Query.Skip(skip).Take(take);
        }
    }
}