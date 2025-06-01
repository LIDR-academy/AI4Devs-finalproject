using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad EstadoProyecto
    /// </summary>
    public class EstadoProyectoRepository : GenericRepository<EstadoProyecto, int>, IEstadoProyectoRepository
    {
        /// <summary>
        /// Constructor que inicializa el repositorio con el contexto de la base de datos
        /// </summary>
        /// <param name="context">Contexto de la base de datos</param>
        public EstadoProyectoRepository(AppDbContext context) : base(context)
        {
        }

        // Implementaciones específicas para EstadoProyecto si son necesarias
    }
}
