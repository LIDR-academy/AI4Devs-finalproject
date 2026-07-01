using Aura.Core.Models;

namespace Aura.Core.Interfaces.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByHashedTokenAsync(string hashedToken, CancellationToken cancellationToken = default);
}
