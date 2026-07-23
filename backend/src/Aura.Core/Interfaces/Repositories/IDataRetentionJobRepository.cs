using Aura.Core.Models;

namespace Aura.Core.Interfaces.Repositories;

public interface IDataRetentionJobRepository : IRepository<DataRetentionJob>
{
    Task<IEnumerable<DataRetentionJob>> GetPendingJobsAsync(DateTimeOffset targetDate, CancellationToken cancellationToken = default);
    Task ExecuteHardDeleteEventDataAsync(Guid eventId, CancellationToken cancellationToken = default);
}
