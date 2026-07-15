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
}
