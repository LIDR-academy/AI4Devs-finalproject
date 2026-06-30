using Aura.Core.Enums;

namespace Aura.Core.Models;

public class UserConsent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public ConsentType ConsentType { get; set; }
    public string TermsVersion { get; set; } = null!;
    public bool IsAccepted { get; set; }
    public DateTimeOffset AcceptedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? WithdrawnAt { get; set; }

    public User User { get; set; } = null!;
}
