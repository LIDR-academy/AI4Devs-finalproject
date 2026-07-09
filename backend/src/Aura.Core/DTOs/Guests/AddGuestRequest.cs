using Aura.Core.Enums;

namespace Aura.Core.DTOs.Guests;

public record AddGuestRequest(
    string Name,
    string? Email,
    string? Phone,
    GuestCategory? Category
);
