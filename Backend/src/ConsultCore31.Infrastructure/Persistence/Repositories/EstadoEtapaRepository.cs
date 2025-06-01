using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad EstadoEtapa
    /// </summary>
    public class EstadoEtapaRepository : GenericRepository<EstadoEtapa, int>, IEstadoEtapaRepository
    {
        /// <summary>
        /// Constructor que inicializa el repositorio con el contexto de la base de datos
        /// </summary>
        /// <param name="context">Contexto de la base de datos</param>
        public EstadoEtapaRepository(AppDbContext context) : base(context)
        {
        }

        // Implementaciones específicas para EstadoEtapa si son necesarias
    }
}
