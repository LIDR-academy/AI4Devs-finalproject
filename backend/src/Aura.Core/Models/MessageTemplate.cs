using Aura.Core.Interfaces;

namespace Aura.Core.Models;

public class MessageTemplate : ISoftDeletable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public string Label { get; set; } = null!;
    public string DefaultMessage { get; set; } = null!;
    public string Icon { get; set; } = null!;
    public bool RequiresSwipe { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Event Event { get; set; } = null!;
    public ICollection<LiveMessage> LiveMessages { get; set; } = new List<LiveMessage>();
}
