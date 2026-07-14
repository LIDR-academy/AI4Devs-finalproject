namespace InkLink.Api.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public Guid ClientId { get; set; }
    public Guid ArtistProfileId { get; set; }
    public int RatingHygiene { get; set; }
    public int RatingPainManagement { get; set; }
    public int RatingCustomerService { get; set; }
    public int RatingResult { get; set; }
    public string? Comment { get; set; }
    public string? TattooPhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; }

    public Booking Booking { get; set; } = null!;
    public User Client { get; set; } = null!;
    public ArtistProfile ArtistProfile { get; set; } = null!;
}
