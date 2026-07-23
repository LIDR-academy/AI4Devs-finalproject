using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Aura.Infrastructure.Repositories;

public class DataRetentionJobRepository : Repository<DataRetentionJob>, IDataRetentionJobRepository
{
    private readonly new ApplicationDbContext _context;

    public DataRetentionJobRepository(ApplicationDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DataRetentionJob>> GetPendingJobsAsync(DateTimeOffset targetDate, CancellationToken cancellationToken = default)
    {
        return await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
            _context.DataRetentionJobs
                .Where(j => j.ScheduledDeleteAt <= targetDate && j.Status == Aura.Core.Enums.JobStatus.Scheduled),
            cancellationToken);
    }

    public async Task ExecuteHardDeleteEventDataAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ExecuteDeleteAsync(_context.Rsvps.IgnoreQueryFilters().Where(x => x.EventId == eventId), cancellationToken);
            await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ExecuteDeleteAsync(_context.LiveMessages.IgnoreQueryFilters().Where(x => x.EventId == eventId), cancellationToken);
            await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ExecuteDeleteAsync(_context.MessageTemplates.IgnoreQueryFilters().Where(x => x.EventId == eventId), cancellationToken);
            await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ExecuteDeleteAsync(_context.Accomplices.IgnoreQueryFilters().Where(x => x.EventId == eventId), cancellationToken);
            await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ExecuteDeleteAsync(_context.Invitations.IgnoreQueryFilters().Where(x => x.EventId == eventId), cancellationToken);
            await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ExecuteDeleteAsync(_context.Guests.IgnoreQueryFilters().Where(x => x.EventId == eventId), cancellationToken);
            await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ExecuteDeleteAsync(_context.Events.IgnoreQueryFilters().Where(x => x.Id == eventId), cancellationToken);
            await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ExecuteDeleteAsync(_context.DataRetentionJobs.IgnoreQueryFilters().Where(x => x.EventId == eventId), cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
