using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Aura.Infrastructure.Repositories;

public class DeliveryLogRepository : Repository<DeliveryLog>, IDeliveryLogRepository
{
    public DeliveryLogRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<DeliveryLog?> GetByProviderMessageIdAsync(string providerMessageId, CancellationToken cancellationToken = default)
    {
        return await _context.DeliveryLogs
            .FirstOrDefaultAsync(l => l.ProviderMessageId == providerMessageId, cancellationToken);
    }

    public async Task<bool> HasRecentLogAsync(Guid entityId, Aura.Core.Enums.DeliveryEntityType entityType, TimeSpan within, CancellationToken cancellationToken = default)
    {
        var cutoffTime = DateTimeOffset.UtcNow.Subtract(within);
        return await _context.DeliveryLogs.AnyAsync(l => 
            l.EntityId == entityId && 
            l.EntityType == entityType && 
            l.SentAt >= cutoffTime, cancellationToken);
    }
}
