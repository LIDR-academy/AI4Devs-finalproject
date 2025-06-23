using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad ComentarioTarea
    /// </summary>
    public class ComentarioTareaRepository : GenericRepository<ComentarioTarea, int>, IComentarioTareaRepository
    {
        /// <summary>
        /// Constructor
        /// </summary>
        public ComentarioTareaRepository(AppDbContext dbContext)
            : base(dbContext)
        {
        }

        // Aquí se pueden implementar métodos específicos para la entidad ComentarioTarea
    }
}