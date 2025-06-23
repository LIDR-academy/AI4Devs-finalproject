using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad Empleado
    /// </summary>
    public class EmpleadoRepository : GenericRepository<Empleado, int>, IEmpleadoRepository
    {
        /// <summary>
        /// Constructor
        /// </summary>
        public EmpleadoRepository(AppDbContext dbContext)
            : base(dbContext)
        {
        }

        // Aquí se pueden implementar métodos específicos para la entidad Empleado
    }
}