using InkLink.Api.Domain.Enums;

namespace InkLink.Api.Domain.Entities;

/// <summary>Seed data in MVP — no upload flow exists.</summary>
public class Certification
{
    public Guid Id { get; set; }
    public Guid ArtistProfileId { get; set; }
    public CertificationType Type { get; set; }
    public string Name { get; set; } = null!;
    public string Issuer { get; set; } = null!;
    public DateOnly ValidUntil { get; set; }
    public bool IsActive { get; set; }

    public ArtistProfile ArtistProfile { get; set; } = null!;
}
