namespace InkLink.Api.Domain.Entities;

public class BlockedDate
{
    public Guid Id { get; set; }
    public Guid ArtistProfileId { get; set; }
    public DateOnly Date { get; set; }
    public string? Reason { get; set; }

    public ArtistProfile ArtistProfile { get; set; } = null!;
}
