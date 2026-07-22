using Aura.Core.Models;

namespace Aura.Core.Interfaces.Repositories;

public interface IInvitationRepository : IRepository<Invitation>
{
    Task<Invitation?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
}
