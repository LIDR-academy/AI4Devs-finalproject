namespace InkLink.Api.Domain.Entities;

public class PortfolioItem
{
    public Guid Id { get; set; }
    public Guid ArtistProfileId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string? ThumbnailUrl { get; set; }
    public Guid StyleId { get; set; }
    public string? Description { get; set; }
    public bool IsFeatured { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }

    public ArtistProfile ArtistProfile { get; set; } = null!;
    public TattooStyle Style { get; set; } = null!;
}
