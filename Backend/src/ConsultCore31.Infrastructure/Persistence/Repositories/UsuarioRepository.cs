// UsuarioRepository.cs
using ConsultCore31.Core.Entities;
using ConsultCore31.Core.Interfaces;
using ConsultCore31.Infrastructure.Persistence.Context;

namespace ConsultCore31.Infrastructure.Persistence.Repositories
{
    public class UsuarioRepository : RepositoryBase<Usuario>, IUsuarioRepository
    {
        private readonly AppDbContext _context;

        public UsuarioRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        /// <inheritdoc />
        public async Task<bool> ExistsByEmailAsync(string email, string? excludeId = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("El correo electrónico no puede estar vacío", nameof(email));

            var query = _context.Usuarios
                .Where(u => EF.Functions.Like(u.Email, email));

            if (!string.IsNullOrEmpty(excludeId) && int.TryParse(excludeId, out int excludeIdInt))
            {
                query = query.Where(u => u.Id != excludeIdInt);
            }
            // Si el excludeId no es un número válido, lo ignoramos

            return await query.AnyAsync(cancellationToken);
        }

        // Implementación de métodos específicos de IUsuarioRepository
        public async Task<Usuario> GetByEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("El correo electrónico no puede estar vacío", nameof(email));

            return await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<Usuario> GetUsuarioConPerfilAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                throw new ArgumentException("El ID no puede estar vacío", nameof(id));
            }

            if (!int.TryParse(id, out int idInt))
            {
                throw new ArgumentException("El ID no es válido", nameof(id));
            }

            return await _context.Usuarios
                .Include(u => u.Perfil)
                .FirstOrDefaultAsync(u => u.Id == idInt);
        }
    }
}