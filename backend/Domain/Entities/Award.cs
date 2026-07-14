namespace InkLink.Api.Domain.Entities;

/// <summary>Seed data in MVP — no upload flow exists.</summary>
public class Award
{
    public Guid Id { get; set; }
    public Guid ArtistProfileId { get; set; }
    public string Title { get; set; } = null!;
    public string EventName { get; set; } = null!;
    public int Year { get; set; }
    public string? Category { get; set; }
    public string? BadgeIconUrl { get; set; }

    public ArtistProfile ArtistProfile { get; set; } = null!;
}
