using Aura.Core.Enums;

namespace Aura.Core.DTOs.Guests;

public record GuestResponse(
    Guid Id,
    string Name,
    string? Email,
    string? Phone,
    GuestCategory Category,
    DeliveryStatus InviteStatus,
    DateTimeOffset CreatedAt
);
