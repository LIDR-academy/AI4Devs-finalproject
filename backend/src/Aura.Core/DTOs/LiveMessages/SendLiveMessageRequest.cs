namespace Aura.Core.DTOs.LiveMessages;

public class SendLiveMessageRequest
{
    public Guid MessageTemplateId { get; set; }
    public string? CustomMessage { get; set; }
}
