using Aura.Core.Enums;

namespace Aura.Core.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? HashedMagicLinkToken { get; set; }
    public DateTimeOffset? TokenExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastLoginAt { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Pending;
    public string Timezone { get; set; } = "Europe/Madrid";
    public string Locale { get; set; } = "es-ES";
    public bool IsAnonymized { get; set; }
    public DateTimeOffset? AnonymizedAt { get; set; }

    public ICollection<UserConsent> Consents { get; set; } = new List<UserConsent>();
    public ICollection<Event> Events { get; set; } = new List<Event>();
}
