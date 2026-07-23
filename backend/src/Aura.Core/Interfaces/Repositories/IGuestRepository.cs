using Aura.Core.Models;

namespace Aura.Core.Interfaces.Repositories;

public interface IGuestRepository : IRepository<Guest>
{
    Task<IEnumerable<Guest>> GetGuestsByEventAsync(Guid eventId, string? category = null, string? search = null);
    Task<int> GetGuestCountAsync(Guid eventId);
    Task<bool> ExistsByEmailAsync(Guid eventId, string email);
    Task<IEnumerable<Guest>> GetPendingReminderGuestsAsync(int daysBeforeEvent, CancellationToken cancellationToken = default);
    Task<IEnumerable<Guest>> GetGuestsByIdsAsync(IEnumerable<Guid> guestIds, CancellationToken cancellationToken = default);
}
