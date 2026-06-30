using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class LiveMessageRepository : Repository<LiveMessage>, ILiveMessageRepository
{
    public LiveMessageRepository(ApplicationDbContext context) : base(context)
    {
    }
}
