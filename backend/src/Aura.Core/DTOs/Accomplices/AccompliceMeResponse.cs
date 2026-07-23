namespace Aura.Core.DTOs.Accomplices;

public class AccompliceMeResponse
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public List<string> Permissions { get; set; } = new();
    public string EventSlug { get; set; } = null!;
}
