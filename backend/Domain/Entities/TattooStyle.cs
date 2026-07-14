namespace InkLink.Api.Domain.Entities;

public class TattooStyle
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? IconUrl { get; set; }

    public ICollection<ArtistStyle> ArtistStyles { get; set; } = new List<ArtistStyle>();
    public ICollection<PortfolioItem> PortfolioItems { get; set; } = new List<PortfolioItem>();
}
