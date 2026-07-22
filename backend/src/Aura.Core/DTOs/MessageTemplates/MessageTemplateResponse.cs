namespace Aura.Core.DTOs.MessageTemplates;

public class MessageTemplateResponse
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public string Label { get; set; } = null!;
    public string DefaultMessage { get; set; } = null!;
    public string Icon { get; set; } = null!;
    public bool RequiresSwipe { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
