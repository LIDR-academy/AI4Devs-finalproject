namespace Aura.Core.Models;

public class Template
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string PreviewUrl { get; set; } = null!;
    public string Category { get; set; } = "wedding";
    public bool IsPremium { get; set; }
    public string LayoutJson { get; set; } = "{}";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Event> Events { get; set; } = new List<Event>();
}
