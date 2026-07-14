using InkLink.Api.Domain.Enums;

namespace InkLink.Api.Domain.Entities;

/// <summary>Seed data in MVP — no management panel exists.</summary>
public class Sponsorship
{
    public Guid Id { get; set; }
    public Guid ArtistProfileId { get; set; }
    public string BrandName { get; set; } = null!;
    public string? BrandLogoUrl { get; set; }
    public SponsorshipRelationType RelationshipType { get; set; }
    public bool IsActive { get; set; }

    public ArtistProfile ArtistProfile { get; set; } = null!;
}
