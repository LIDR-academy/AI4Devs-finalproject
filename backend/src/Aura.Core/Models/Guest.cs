using Aura.Core.Enums;
using Aura.Core.Interfaces;

namespace Aura.Core.Models;

public class Guest : ISoftDeletable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public GuestCategory Category { get; set; } = GuestCategory.Other;
    public DeliveryStatus InviteStatus { get; set; } = DeliveryStatus.Pending;
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public bool IsAnonymized { get; set; }
    public DateTimeOffset? AnonymizedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Event Event { get; set; } = null!;
    public ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();
}
