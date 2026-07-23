namespace Aura.Core.Interfaces.Services;

public interface IDataRetentionService
{
    Task ProcessDataRetentionJobsAsync(CancellationToken cancellationToken = default);
}
