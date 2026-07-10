using Aura.Core.DTOs.Guests;

namespace Aura.Core.Interfaces.Services;

public interface IGuestService
{
    Task<GuestResponse> AddGuestAsync(Guid userId, string eventSlug, AddGuestRequest request);
    Task<ImportResult> ImportGuestsFromCsvAsync(Guid userId, string eventSlug, Stream csvStream);
    Task<IEnumerable<GuestResponse>> GetGuestsByEventAsync(Guid userId, string eventSlug, string? category = null, string? search = null);
    Task SoftDeleteGuestAsync(Guid userId, string eventSlug, Guid guestId);
    Task<int> GetGuestCountAsync(Guid eventId);
}
