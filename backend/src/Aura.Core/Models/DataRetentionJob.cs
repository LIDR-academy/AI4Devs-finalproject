using Aura.Core.Enums;

namespace Aura.Core.Models;

public class DataRetentionJob
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public DateTimeOffset ScheduledDeleteAt { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Scheduled;
    public DateTimeOffset? ExecutedAt { get; set; }
    public string? FailureReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Event Event { get; set; } = null!;
}
