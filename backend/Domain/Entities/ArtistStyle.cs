namespace InkLink.Api.Domain.Entities;

public class ArtistStyle
{
    public Guid ArtistProfileId { get; set; }
    public Guid StyleId { get; set; }

    public ArtistProfile ArtistProfile { get; set; } = null!;
    public TattooStyle Style { get; set; } = null!;
}
