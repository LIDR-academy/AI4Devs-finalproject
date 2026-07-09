using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Aura.Infrastructure.Repositories;

public class EventRepository : Repository<Event>, IEventRepository
{
    public EventRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Event?> GetBySlugAsync(string slug)
    {
        return await _context.Set<Event>()
            .Include(e => e.Guests)
            .FirstOrDefaultAsync(e => e.Slug == slug);
    }

    public Task<bool> ExistsBySlugAsync(string slug)
    {
        return _context.Set<Event>().AnyAsync(e => e.Slug == slug);
    }

    public async Task<IEnumerable<Event>> GetByUserIdAsync(Guid userId)
    {
        return await _context.Set<Event>()
            .Include(e => e.Guests)
                .ThenInclude(g => g.Invitations)
                    .ThenInclude(i => i.Rsvp)
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }
}
