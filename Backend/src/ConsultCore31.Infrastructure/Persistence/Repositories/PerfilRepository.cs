// PerfilRepository.cs
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    public class PerfilRepository : RepositoryBase<Perfil>, IPerfilRepository
    {
        private readonly AppDbContext _context;

        public PerfilRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> ExistsByNombreAsync(string nombre, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre no puede estar vacío", nameof(nombre));

            var query = _context.Perfiles
                .Where(p => EF.Functions.Like(p.PerfilNombre, nombre));

            if (excludeId.HasValue)
            {
                query = query.Where(p => p.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<Perfil?> GetByNombreAsync(string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre no puede estar vacío", nameof(nombre));

            return await _context.Perfiles
                .FirstOrDefaultAsync(p => EF.Functions.Like(p.PerfilNombre, nombre));
        }

        public async Task<Perfil?> GetPerfilConRelacionesAsync(int id)
        {
            return await _context.Perfiles
                .Include(p => p.Objeto)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        // Implementación de métodos específicos de IPerfilRepository
        public async Task<IEnumerable<Perfil>> GetPerfilesActivosAsync()
        {
            return await _context.Perfiles
                .Where(p => p.PerfilActivo)
                .ToListAsync();
        }
    }
}