using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad Tarea
    /// </summary>
    public class TareaRepository : GenericRepository<Tarea, int>, ITareaRepository
    {
        /// <summary>
        /// Constructor
        /// </summary>
        public TareaRepository(AppDbContext dbContext)
            : base(dbContext)
        {
        }

        // Aquí se pueden implementar métodos específicos para la entidad Tarea
    }
}
