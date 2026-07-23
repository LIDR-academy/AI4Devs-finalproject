using Aura.Core.Models;
using Aura.Infrastructure.Data;
using Aura.Core.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Aura.Infrastructure.Repositories;

public class MessageTemplateRepository : Repository<MessageTemplate>, IMessageTemplateRepository
{
    private readonly new ApplicationDbContext _context;

    public MessageTemplateRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MessageTemplate>> GetByEventIdAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        return await _context.MessageTemplates
            .Where(m => m.EventId == eventId)
            .ToListAsync(cancellationToken);
    }
}
