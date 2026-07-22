using Aura.Core.Models;

namespace Aura.Core.Interfaces.Repositories;

public interface IAccompliceRepository : IRepository<Accomplice>
{
    Task<Accomplice?> GetByTokenAsync(string tokenHash, CancellationToken cancellationToken = default);
}
