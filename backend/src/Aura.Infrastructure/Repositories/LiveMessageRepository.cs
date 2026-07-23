using Aura.Core.Models;
using Aura.Infrastructure.Data;
using Aura.Core.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Aura.Infrastructure.Repositories;

public class LiveMessageRepository : Repository<LiveMessage>, ILiveMessageRepository
{
    private readonly new ApplicationDbContext _context;

    public LiveMessageRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LiveMessage>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        return await _context.LiveMessages
            .Where(m => m.EventId == eventId)
            .ToListAsync(cancellationToken);
    }
}
