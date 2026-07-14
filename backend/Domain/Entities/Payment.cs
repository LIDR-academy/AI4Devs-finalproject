using InkLink.Api.Domain.Enums;

namespace InkLink.Api.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public string? FlowTransactionId { get; set; }
    public int Amount { get; set; }
    public int PlatformFee { get; set; }
    public int ArtistAmount { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime? PaidAt { get; set; }

    public Booking Booking { get; set; } = null!;
}
