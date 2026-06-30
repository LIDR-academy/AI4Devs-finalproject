using Aura.Core.Enums;

namespace Aura.Core.Models;

public class DeliveryLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public DeliveryEntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public Channel Channel { get; set; }
    public string MessageType { get; set; } = null!;
    public DeliveryStatus DeliveryStatus { get; set; } = DeliveryStatus.Pending;
    public string? ProviderMessageId { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public DateTimeOffset? DeliveredAt { get; set; }
    public DateTimeOffset? FailedAt { get; set; }
    public int RetryCount { get; set; }
    public string? FailureReason { get; set; }

    public Event Event { get; set; } = null!;
}
