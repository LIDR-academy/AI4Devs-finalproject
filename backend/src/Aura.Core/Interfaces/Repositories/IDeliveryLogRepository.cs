using Aura.Core.Models;

namespace Aura.Core.Interfaces.Repositories;

public interface IDeliveryLogRepository : IRepository<DeliveryLog>
{
    Task<DeliveryLog?> GetByProviderMessageIdAsync(string providerMessageId, CancellationToken cancellationToken = default);
}
