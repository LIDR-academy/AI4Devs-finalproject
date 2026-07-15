using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Email;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Aura.Infrastructure.Queue;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aura.Workers.Email;

public class EmailDispatcherWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailDispatcherWorker> _logger;

    public EmailDispatcherWorker(IServiceProvider serviceProvider, ILogger<EmailDispatcherWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email Dispatcher Worker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var queueService = scope.ServiceProvider.GetRequiredService<IQueueService>();

                // Blocking dequeue (or delay if empty)
                var message = await queueService.DequeueAsync(QueueNames.EmailQueue, stoppingToken);
                if (!string.IsNullOrEmpty(message))
                {
                    await ProcessMessageAsync(message, scope, stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                // Graceful shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the email queue.");
                await Task.Delay(5000, stoppingToken); // Backoff on generic error
            }
        }

        _logger.LogInformation("Email Dispatcher Worker is stopping.");
    }

    public async Task ProcessMessageAsync(string message, IServiceScope scope, CancellationToken cancellationToken)
    {
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var deliveryLogRepo = scope.ServiceProvider.GetRequiredService<IDeliveryLogRepository>();
        var templateRenderer = scope.ServiceProvider.GetRequiredService<EmailTemplateRenderer>();

        EmailMessagePayload? payload;
        try
        {
            payload = JsonSerializer.Deserialize<EmailMessagePayload>(message, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (payload == null) throw new Exception("Payload deserialized to null.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deserialize message: {Message}", message);
            return;
        }

        DeliveryLog? log = null;
        if (payload.DeliveryLogId.HasValue)
        {
            log = await deliveryLogRepo.GetByIdAsync(payload.DeliveryLogId.Value, cancellationToken);
        }

        try
        {
            // Render HTML
            string htmlContent = await templateRenderer.RenderAsync(payload.TemplateName, payload.Tokens);

            // Send Email
            await emailService.SendEmailAsync(payload.To, payload.Subject, htmlContent);
            
            _logger.LogInformation("Successfully sent email to {To} with subject {Subject}", payload.To, payload.Subject);

            if (log != null)
            {
                log.DeliveryStatus = DeliveryStatus.Delivered;
                log.SentAt = DateTimeOffset.UtcNow;
                log.DeliveredAt = DateTimeOffset.UtcNow;
                await deliveryLogRepo.UpdateAsync(log, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", payload.To);
            
            if (log != null)
            {
                log.DeliveryStatus = DeliveryStatus.Failed;
                log.FailedAt = DateTimeOffset.UtcNow;
                log.FailureReason = ex.Message;
                log.RetryCount++;
                await deliveryLogRepo.UpdateAsync(log, cancellationToken);
            }
        }
    }
}
