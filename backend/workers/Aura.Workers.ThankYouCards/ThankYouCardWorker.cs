using Aura.Core.Interfaces.Services;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace Aura.Workers.ThankYouCards;

public class ThankYouCardWorker : BackgroundService
{
    private readonly ILogger<ThankYouCardWorker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    public ThankYouCardWorker(
        ILogger<ThankYouCardWorker> logger, 
        IServiceProvider serviceProvider,
        IHostApplicationLifetime hostApplicationLifetime)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _hostApplicationLifetime = hostApplicationLifetime;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ThankYouCardWorker started at: {time}", DateTimeOffset.Now);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var service = scope.ServiceProvider.GetRequiredService<IThankYouCardService>();

            await service.ProcessAutomatedThankYouCardsAsync(stoppingToken);

            _logger.LogInformation("Finished processing automated thank you cards.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while processing automated thank you cards.");
            Environment.ExitCode = 1;
        }
        finally
        {
            _hostApplicationLifetime.StopApplication();
        }
    }
}
