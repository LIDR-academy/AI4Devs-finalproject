namespace Aura.Core.DTOs.MessageTemplates;

public class UpdateMessageTemplateRequest
{
    public string Label { get; set; } = null!;
    public string DefaultMessage { get; set; } = null!;
    public string Icon { get; set; } = null!;
}
