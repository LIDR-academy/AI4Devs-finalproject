using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad Proyecto
    /// </summary>
    public class ProyectoRepository : GenericRepository<Proyecto, int>, IProyectoRepository
    {
        /// <summary>
        /// Constructor
        /// </summary>
        public ProyectoRepository(AppDbContext dbContext)
            : base(dbContext)
        {
        }

        // Aquí se pueden implementar métodos específicos para la entidad Proyecto
    }
}
