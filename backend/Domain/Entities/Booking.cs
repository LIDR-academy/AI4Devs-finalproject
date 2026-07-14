using InkLink.Api.Domain.Enums;

namespace InkLink.Api.Domain.Entities;

public class Booking
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public Guid ArtistProfileId { get; set; }
    public DateOnly BookingDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public BookingStatus Status { get; set; }
    public int EstimatedPriceMin { get; set; }
    public int EstimatedPriceMax { get; set; }
    public int DepositAmount { get; set; }
    public string? BodyZone { get; set; }
    public string? SizeReference { get; set; }
    public Guid? StyleId { get; set; }
    public bool IsColor { get; set; }
    public bool IsCoverup { get; set; }
    public List<string> ReferenceImages { get; set; } = new();
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    /// <summary>Hold expiration: only meaningful while status is PendingPayment (5-minute TTL).</summary>
    public DateTime? ExpiresAt { get; set; }

    public User Client { get; set; } = null!;
    public ArtistProfile ArtistProfile { get; set; } = null!;
    public TattooStyle? Style { get; set; }
    public Payment? Payment { get; set; }
    public Review? Review { get; set; }
}
