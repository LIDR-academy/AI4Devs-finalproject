using Aura.Core.Interfaces.Services;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace Aura.Workers.Reminders;

public class ReminderSchedulerWorker : BackgroundService
{
    private readonly ILogger<ReminderSchedulerWorker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    public ReminderSchedulerWorker(
        ILogger<ReminderSchedulerWorker> logger, 
        IServiceProvider serviceProvider,
        IHostApplicationLifetime hostApplicationLifetime)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _hostApplicationLifetime = hostApplicationLifetime;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReminderSchedulerWorker started at: {time}", DateTimeOffset.Now);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var reminderService = scope.ServiceProvider.GetRequiredService<IReminderService>();

            await reminderService.ProcessAutomatedRemindersAsync(stoppingToken);

            _logger.LogInformation("Finished processing automated reminders.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while processing automated reminders.");
            Environment.ExitCode = 1;
        }
        finally
        {
            _hostApplicationLifetime.StopApplication();
        }
    }
}
