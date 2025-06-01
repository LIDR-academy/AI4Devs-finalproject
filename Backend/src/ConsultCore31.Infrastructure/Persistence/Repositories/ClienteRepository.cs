using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad Cliente
    /// </summary>
    public class ClienteRepository : GenericRepository<Cliente, int>, IClienteRepository
    {
        /// <summary>
        /// Constructor
        /// </summary>
        public ClienteRepository(AppDbContext dbContext)
            : base(dbContext)
        {
        }

        // Aquí se pueden implementar métodos específicos para la entidad Cliente
    }
}
