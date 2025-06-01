using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para categorías de gasto
    /// </summary>
    public class CategoriaGastoRepository : GenericRepository<CategoriaGasto, int>, ICategoriaGastoRepository
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="appDbContext">Contexto de la base de datos</param>
        public CategoriaGastoRepository(AppDbContext appDbContext) : base(appDbContext)
        {
            // La funcionalidad básica está implementada en la clase base
        }

        // Implementación de métodos específicos para CategoriaGasto si son necesarios
    }
}