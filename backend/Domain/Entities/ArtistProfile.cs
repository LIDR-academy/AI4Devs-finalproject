using InkLink.Api.Domain.Enums;

namespace InkLink.Api.Domain.Entities;

public class ArtistProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Slug { get; set; } = null!;
    public string? Bio { get; set; }
    public int YearsExperience { get; set; }
    public ArtistType ArtistType { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string? Address { get; set; }
    public string Commune { get; set; } = null!;
    public int MinSessionPrice { get; set; }
    public int HourlyRate { get; set; }
    public int DepositPercentage { get; set; } = 30;
    public CancellationPolicy CancellationPolicy { get; set; }
    public bool IsPublished { get; set; }
    public decimal RatingAvg { get; set; }
    public int TotalReviews { get; set; }

    public User User { get; set; } = null!;
    public ICollection<PortfolioItem> PortfolioItems { get; set; } = new List<PortfolioItem>();
    public ICollection<ArtistStyle> ArtistStyles { get; set; } = new List<ArtistStyle>();
    public ICollection<Availability> Availabilities { get; set; } = new List<Availability>();
    public ICollection<BlockedDate> BlockedDates { get; set; } = new List<BlockedDate>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Certification> Certifications { get; set; } = new List<Certification>();
    public ICollection<Award> Awards { get; set; } = new List<Award>();
    public ICollection<Sponsorship> Sponsorships { get; set; } = new List<Sponsorship>();
}
