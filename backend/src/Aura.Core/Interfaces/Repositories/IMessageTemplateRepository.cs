using Aura.Core.Models;

namespace Aura.Core.Interfaces.Repositories;

public interface IMessageTemplateRepository : IRepository<MessageTemplate>
{
    Task<IEnumerable<MessageTemplate>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default);
}
