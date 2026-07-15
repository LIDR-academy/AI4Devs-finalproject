using System;
using System.Collections.Generic;

namespace Aura.Core.DTOs.Email;

public class EmailMessagePayload
{
    public string Type { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string TemplateName { get; set; } = string.Empty;
    public Dictionary<string, string> Tokens { get; set; } = new();
    public Guid? EventId { get; set; }
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public Guid? DeliveryLogId { get; set; }
}
