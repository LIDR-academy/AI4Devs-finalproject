using Aura.Core.Enums;

namespace Aura.Core.Models;

public class LiveMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public Guid AccompliceId { get; set; }
    public Guid MessageTemplateId { get; set; }
    public string? CustomMessage { get; set; }
    public Channel SentVia { get; set; } = Channel.WhatsApp;
    public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;
    public DeliveryStatus DeliveryStatus { get; set; } = DeliveryStatus.Pending;
    public int RetryCount { get; set; }

    public Event Event { get; set; } = null!;
    public Accomplice Accomplice { get; set; } = null!;
    public MessageTemplate MessageTemplate { get; set; } = null!;
}
