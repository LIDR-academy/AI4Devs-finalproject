// PerfilRepository.cs
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    public class PerfilRepository : GenericRepository<Perfil, int>, IPerfilRepository
    {
        private readonly AppDbContext _context;

        public PerfilRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<bool> ExistsByNombreAsync(string nombre, int? excludeId = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre no puede estar vacío", nameof(nombre));

            var query = _context.Perfiles
                .Where(p => EF.Functions.Like(p.PerfilNombre, nombre));

            if (excludeId.HasValue)
            {
                query = query.Where(p => p.Id != excludeId.Value);
            }

            return await query.AnyAsync(cancellationToken);
        }

        public async Task<Perfil?> GetByNombreAsync(string nombre, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre no puede estar vacío", nameof(nombre));

            return await _context.Perfiles
                .FirstOrDefaultAsync(p => EF.Functions.Like(p.PerfilNombre, nombre), cancellationToken);
        }

        public async Task<Perfil?> GetPerfilConRelacionesAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Perfiles
                .Include(p => p.Objeto)
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        }

        // Implementación de métodos específicos de IPerfilRepository
        public async Task<IEnumerable<Perfil>> GetPerfilesActivosAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Perfiles
                .Where(p => p.PerfilActivo)
                .ToListAsync(cancellationToken);
        }
        
        // Sobrescribir el método GetAllActiveAsync para usar PerfilActivo en lugar de Activo
        public override async Task<IReadOnlyList<Perfil>> GetAllActiveAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Perfiles
                .Where(p => p.PerfilActivo)
                .ToListAsync(cancellationToken);
        }
    }
}