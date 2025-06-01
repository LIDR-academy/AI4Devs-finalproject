using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Ardalis.Specification;
using Ardalis.Specification.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ConsultCore31.Infrastructure.Persistence
{
    public static class SpecificationEvaluator<T> where T : class
    {
        public static IQueryable<T> GetQuery(IQueryable<T> inputQuery, ISpecification<T> specification)
        {
            var evaluator = new SpecificationEvaluator();
            return evaluator.GetQuery(inputQuery, specification);
        }
    }
}
