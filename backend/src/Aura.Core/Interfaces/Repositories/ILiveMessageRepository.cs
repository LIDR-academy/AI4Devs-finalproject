using Aura.Core.Models;

namespace Aura.Core.Interfaces.Repositories;

public interface ILiveMessageRepository : IRepository<LiveMessage>
{
    Task<IEnumerable<LiveMessage>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);
}
