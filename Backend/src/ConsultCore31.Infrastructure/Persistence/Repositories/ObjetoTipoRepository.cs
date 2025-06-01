using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    /// <summary>
    /// Implementación del repositorio de ObjetoTipo
    /// </summary>
    public class ObjetoTipoRepository : RepositoryBase<ObjetoTipo>, IObjetoTipoRepository
    {
        private readonly AppDbContext _context;

        public ObjetoTipoRepository(AppDbContext context) : base(context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        /// <inheritdoc />
        public async Task<ObjetoTipo?> GetByNombreAsync(string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre no puede estar vacío", nameof(nombre));

            return await _context.ObjetosTipo
                .FirstOrDefaultAsync(ot => ot.ObjetoTipoNombre.ToLower() == nombre.ToLower());
        }

        /// <inheritdoc />
        public async Task<bool> ExistsByNombreAsync(string nombre, int? excludeId = null)
        {
            var query = _context.ObjetosTipo
                .Where(ot => ot.ObjetoTipoNombre.ToLower() == nombre.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(ot => ot.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        /// <inheritdoc />
        public async Task<IEnumerable<ObjetoTipo>> GetAllActiveAsync()
        {
            return await _context.ObjetosTipo
                .Where(ot => ot.ObjetoTipoActivo)
                .ToListAsync();
        }
    }
}