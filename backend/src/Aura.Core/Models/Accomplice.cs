namespace Aura.Core.Models;

public class Accomplice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public string Email { get; set; } = null!;
    public string TokenHash { get; set; } = null!;
    public string Permissions { get; set; } = "[\"send_messages\",\"view_rsvps\"]";
    public DateTimeOffset GrantedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? LastAccessedAt { get; set; }
    public bool IsRevoked { get; set; }
    public bool IsAnonymized { get; set; }
    public DateTimeOffset? AnonymizedAt { get; set; }

    public Event Event { get; set; } = null!;
    public ICollection<LiveMessage> LiveMessages { get; set; } = new List<LiveMessage>();
}
