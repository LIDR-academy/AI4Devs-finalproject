using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

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

    public async Task<IEnumerable<Guest>> GetPendingReminderGuestsAsync(int daysBeforeEvent, CancellationToken cancellationToken = default)
    {
        var targetDate = DateTimeOffset.UtcNow.AddDays(daysBeforeEvent);
        
        var query = _context.Guests
            .Include(g => g.Event)
            .Include(g => g.Invitations)
            .Where(g => !g.IsDeleted 
                     && g.Event.Status == Aura.Core.Enums.EventStatus.Published
                     && g.Event.EventDate <= targetDate
                     && g.Invitations.Any(i => i.DeliveryStatus == Aura.Core.Enums.DeliveryStatus.Sent || i.DeliveryStatus == Aura.Core.Enums.DeliveryStatus.Delivered)
                     && !g.Invitations.Any(i => i.Rsvp != null));

        return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(query, cancellationToken);
    }

    public async Task<IEnumerable<Guest>> GetGuestsByIdsAsync(IEnumerable<Guid> guestIds, CancellationToken cancellationToken = default)
    {
        return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
            _context.Guests
                .Include(g => g.Event)
                .Include(g => g.Invitations)
                .Where(g => guestIds.Contains(g.Id)), 
            cancellationToken);
    }

    public async Task<IEnumerable<Guest>> GetGuestsForThankYouCardsAsync(CancellationToken cancellationToken = default)
    {
        var targetDate = DateTimeOffset.UtcNow.AddDays(-1).Date;

        var query = _context.Guests
            .Include(g => g.Event)
            .Include(g => g.Invitations)
                .ThenInclude(i => i.Rsvp)
            .Where(g => !g.IsDeleted
                     && g.Event.Status == Aura.Core.Enums.EventStatus.Published
                     && g.Event.EventDate.Date == targetDate
                     && g.Invitations.Any(i => i.Rsvp != null && i.Rsvp.Attendance == Aura.Core.Enums.RsvpAttendance.Yes));

        return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(query, cancellationToken);
    }
}
