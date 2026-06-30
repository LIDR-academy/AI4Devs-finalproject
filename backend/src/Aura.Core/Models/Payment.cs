using Aura.Core.Enums;

namespace Aura.Core.Models;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public string? StripeCustomerId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public PaymentTier Tier { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; set; }

    public Event Event { get; set; } = null!;
}
