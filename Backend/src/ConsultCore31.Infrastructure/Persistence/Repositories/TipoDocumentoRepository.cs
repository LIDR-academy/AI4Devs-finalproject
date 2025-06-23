using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio para la entidad TipoDocumento
    /// </summary>
    public class TipoDocumentoRepository : GenericRepository<TipoDocumento, int>, ITipoDocumentoRepository
    {
        /// <summary>
        /// Constructor que inicializa el repositorio con el contexto de la base de datos
        /// </summary>
        /// <param name="context">Contexto de la base de datos</param>
        public TipoDocumentoRepository(AppDbContext context) : base(context)
        {
        }

        /// <summary>
        /// Obtiene todos los tipos de documento activos (no eliminados lógicamente)
        /// </summary>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>Lista de tipos de documento activos</returns>
        public override async Task<IReadOnlyList<TipoDocumento>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .ToListAsync(cancellationToken);
        }

        /// <summary>
        /// Realiza un borrado lógico de un tipo de documento
        /// </summary>
        /// <param name="id">ID del tipo de documento a eliminar</param>
        /// <param name="cancellationToken">Token de cancelación</param>
        /// <returns>True si se eliminó correctamente, False si no se encontró</returns>
        public override async Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var tipoDocumento = await _dbSet.FirstOrDefaultAsync(e => e.Id.Equals(id), cancellationToken);
            if (tipoDocumento == null)
            {
                return false;
            }

            // Actualizamos los campos de borrado lógico
            tipoDocumento.FechaModificacion = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}