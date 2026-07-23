using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Microsoft.Extensions.Logging;

namespace Aura.Core.Services;

public class DataRetentionService : IDataRetentionService
{
    private readonly IDataRetentionJobRepository _dataRetentionJobRepository;
    private readonly ILogger<DataRetentionService> _logger;

    public DataRetentionService(
        IDataRetentionJobRepository dataRetentionJobRepository,
        ILogger<DataRetentionService> logger)
    {
        _dataRetentionJobRepository = dataRetentionJobRepository;
        _logger = logger;
    }

    public async Task ProcessDataRetentionJobsAsync(CancellationToken cancellationToken = default)
    {
        var targetDate = DateTimeOffset.UtcNow;
        var pendingJobs = await _dataRetentionJobRepository.GetPendingJobsAsync(targetDate, cancellationToken);

        foreach (var job in pendingJobs)
        {
            try
            {
                _logger.LogInformation("Starting data retention deletion for EventId: {EventId}", job.EventId);

                // Update status to running
                job.Status = JobStatus.Running;
                job.UpdatedAt = DateTimeOffset.UtcNow;
                await _dataRetentionJobRepository.UpdateAsync(job, cancellationToken);

                // Execute hard delete for all associated data
                await _dataRetentionJobRepository.ExecuteHardDeleteEventDataAsync(job.EventId, cancellationToken);

                _logger.LogInformation("Successfully deleted data for EventId: {EventId}", job.EventId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete data for EventId: {EventId}", job.EventId);

                // Increment retry count and update status
                job.RetryCount++;
                job.FailureReason = ex.Message;
                job.UpdatedAt = DateTimeOffset.UtcNow;

                if (job.RetryCount >= 3)
                {
                    job.Status = JobStatus.Failed;
                    _logger.LogCritical("Data retention job for EventId: {EventId} has failed {RetryCount} times and will no longer be retried.", job.EventId, job.RetryCount);
                }
                else
                {
                    // Will be retried on next cron execution
                    job.Status = JobStatus.Scheduled;
                }

                await _dataRetentionJobRepository.UpdateAsync(job, cancellationToken);
            }
        }
    }
}
