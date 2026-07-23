namespace Aura.Core.DTOs.Accomplices;

public class AccompliceResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public List<string> Permissions { get; set; } = new();
    public DateTimeOffset GrantedAt { get; set; }
    public DateTimeOffset? LastAccessedAt { get; set; }
    public bool IsRevoked { get; set; }
}
