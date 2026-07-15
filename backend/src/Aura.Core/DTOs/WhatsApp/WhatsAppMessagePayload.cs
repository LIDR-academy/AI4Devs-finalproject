using System;
using System.Collections.Generic;

namespace Aura.Core.DTOs.WhatsApp;

public class WhatsAppMessagePayload
{
    public string Type { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public string? TextMessage { get; set; }
    public Dictionary<string, string> Variables { get; set; } = new();
    
    public Guid? DeliveryLogId { get; set; }
    public int Attempt { get; set; } = 1;
}
