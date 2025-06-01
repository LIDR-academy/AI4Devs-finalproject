using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad TipoKPI
    /// </summary>
    public class TipoKPIRepository : GenericRepository<TipoKPI, int>, ITipoKPIRepository
    {
        /// <summary>
        /// Constructor que inicializa el repositorio con el contexto de la base de datos
        /// </summary>
        /// <param name="context">Contexto de la base de datos</param>
        public TipoKPIRepository(AppDbContext context) : base(context)
        {
        }

        // Implementaciones específicas para TipoKPI si son necesarias
    }
}
