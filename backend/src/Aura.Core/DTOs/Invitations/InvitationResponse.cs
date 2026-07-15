using System;
using Aura.Core.Enums;

namespace Aura.Core.DTOs.Invitations;

public class InvitationResponse
{
    public Guid Id { get; set; }
    public Guid GuestId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string? GuestEmail { get; set; }
    public Channel? SentVia { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public DeliveryStatus DeliveryStatus { get; set; }
}
