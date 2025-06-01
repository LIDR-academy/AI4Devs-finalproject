// ObjetoRepository.cs
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    public class ObjetoRepository : RepositoryBase<Objeto>, IObjetoRepository
    {
        private readonly AppDbContext _context;

        public ObjetoRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        // Implementación de métodos específicos de IObjetoRepository
        public async Task<IEnumerable<Objeto>> GetObjetosByTipoIdAsync(int tipoId)
        {
            return await _context.Objetos
                .Where(o => o.ObjetoTipoId == tipoId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Objeto>> GetObjetosActivosAsync()
        {
            return await _context.Objetos
                .Where(o => o.ObjetoActivo)
                .Include(o => o.ObjetoTipo)
                .ToListAsync();
        }

        public async Task<Objeto> GetByNombreAsync(string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre no puede estar vacío", nameof(nombre));

            return await _context.Objetos
                .Include(o => o.ObjetoTipo)
                .FirstOrDefaultAsync(o => EF.Functions.Like(o.ObjetoNombre, nombre));
        }

        public async Task<bool> ExistsByNombreAsync(string nombre, int? excludeId = null)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new ArgumentException("El nombre no puede estar vacío", nameof(nombre));

            var query = _context.Objetos
                .Where(o => EF.Functions.Like(o.ObjetoNombre, nombre));

            if (excludeId.HasValue)
            {
                query = query.Where(o => o.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<IEnumerable<Objeto>> GetAllWithTipoAsync()
        {
            return await _context.Objetos
                .Include(o => o.ObjetoTipo)
                .ToListAsync();
        }

        public async Task<Objeto> GetByIdWithTipoAsync(int id)
        {
            return await _context.Objetos
                .Include(o => o.ObjetoTipo)
                .FirstOrDefaultAsync(o => o.Id == id);
        }
    }
}