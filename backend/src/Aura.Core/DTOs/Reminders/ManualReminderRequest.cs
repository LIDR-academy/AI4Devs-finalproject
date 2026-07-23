using System;
using System.Collections.Generic;

namespace Aura.Core.DTOs.Reminders;

public class ManualReminderRequest
{
    public IEnumerable<Guid> GuestIds { get; set; } = new List<Guid>();
}
