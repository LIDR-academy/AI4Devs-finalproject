using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class DeliveryLogRepository : Repository<DeliveryLog>, IDeliveryLogRepository
{
    public DeliveryLogRepository(ApplicationDbContext context) : base(context)
    {
    }
}
