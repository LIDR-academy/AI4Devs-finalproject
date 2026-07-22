using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;

namespace Aura.Infrastructure.Repositories;

public class GuestRepository : Repository<Guest>, IGuestRepository
{
    private readonly new ApplicationDbContext _context;

    public GuestRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Guest>> GetGuestsByEventAsync(Guid eventId, string? category = null, string? search = null)
    {
        var query = _context.Guests.Where(g => g.EventId == eventId);

        if (!string.IsNullOrWhiteSpace(category) && Enum.TryParse<Aura.Core.Enums.GuestCategory>(category, true, out var catEnum))
        {
            query = query.Where(g => g.Category == catEnum);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(g => g.Name.Contains(search) || (g.Email != null && g.Email.Contains(search)));
        }

        return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(query);
    }

    public async Task<int> GetGuestCountAsync(Guid eventId)
    {
        return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(_context.Guests, g => g.EventId == eventId);
    }

    public async Task<bool> ExistsByEmailAsync(Guid eventId, string email)
    {
        return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.AnyAsync(_context.Guests, g => g.EventId == eventId && g.Email == email);
    }
}
