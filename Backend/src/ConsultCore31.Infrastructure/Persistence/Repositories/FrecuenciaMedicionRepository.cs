using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad FrecuenciaMedicion
    /// </summary>
    public class FrecuenciaMedicionRepository : GenericRepository<FrecuenciaMedicion, int>, IFrecuenciaMedicionRepository
    {
        /// <summary>
        /// Constructor que inicializa el repositorio con el contexto de la base de datos
        /// </summary>
        /// <param name="context">Contexto de la base de datos</param>
        public FrecuenciaMedicionRepository(AppDbContext context) : base(context)
        {
        }

        // Implementaciones específicas para FrecuenciaMedicion si son necesarias
    }
}
