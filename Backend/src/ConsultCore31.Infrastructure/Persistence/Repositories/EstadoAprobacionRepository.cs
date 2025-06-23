using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad EstadoAprobacion
    /// </summary>
    public class EstadoAprobacionRepository : GenericRepository<EstadoAprobacion, int>, IEstadoAprobacionRepository
    {
        /// <summary>
        /// Constructor que inicializa el repositorio con el contexto de la base de datos
        /// </summary>
        /// <param name="context">Contexto de la base de datos</param>
        public EstadoAprobacionRepository(AppDbContext context) : base(context)
        {
        }

        // Implementaciones específicas para EstadoAprobacion si son necesarias
    }
}