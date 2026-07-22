using Aura.Core.Enums;

namespace Aura.Core.DTOs.LiveMessages;

public class LiveMessageResponse
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid AccompliceId { get; set; }
    public Guid MessageTemplateId { get; set; }
    public string? CustomMessage { get; set; }
    public Channel SentVia { get; set; }
    public DateTimeOffset SentAt { get; set; }
    public DeliveryStatus DeliveryStatus { get; set; }
}
