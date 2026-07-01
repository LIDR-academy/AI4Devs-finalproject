using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Aura.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Set<User>().FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByHashedTokenAsync(string hashedToken, CancellationToken cancellationToken = default)
    {
        return await _context.Set<User>().FirstOrDefaultAsync(u => u.HashedMagicLinkToken == hashedToken, cancellationToken);
    }
}
