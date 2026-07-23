using Aura.Core.Interfaces.Services;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace Aura.Workers.DataRetention;

public class DataRetentionWorker : BackgroundService
{
    private readonly ILogger<DataRetentionWorker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    public DataRetentionWorker(
        ILogger<DataRetentionWorker> logger, 
        IServiceProvider serviceProvider,
        IHostApplicationLifetime hostApplicationLifetime)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _hostApplicationLifetime = hostApplicationLifetime;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DataRetentionWorker started at: {time}", DateTimeOffset.Now);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dataRetentionService = scope.ServiceProvider.GetRequiredService<IDataRetentionService>();

            await dataRetentionService.ProcessDataRetentionJobsAsync(stoppingToken);

            _logger.LogInformation("Finished processing data retention jobs.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while processing data retention jobs.");
            Environment.ExitCode = 1;
        }
        finally
        {
            _hostApplicationLifetime.StopApplication();
        }
    }
}
