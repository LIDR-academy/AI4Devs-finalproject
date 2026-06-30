using Aura.Core.Enums;
using Aura.Core.Interfaces;

namespace Aura.Core.Models;

public class Invitation : ISoftDeletable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GuestId { get; set; }
    public Guid EventId { get; set; }
    public string TokenHash { get; set; } = null!;
    public Channel? SentVia { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public DeliveryStatus DeliveryStatus { get; set; } = DeliveryStatus.Pending;
    public int RetryCount { get; set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Guest Guest { get; set; } = null!;
    public Event Event { get; set; } = null!;
    public Rsvp? Rsvp { get; set; }
}
