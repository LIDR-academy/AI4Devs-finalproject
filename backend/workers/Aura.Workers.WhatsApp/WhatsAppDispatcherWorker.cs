using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Email;
using Aura.Core.DTOs.WhatsApp;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Aura.Workers.WhatsApp;

public class WhatsAppDispatcherWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<WhatsAppDispatcherWorker> _logger;
    private const string QueueName = "whatsapp:queue";
    private const string RetryQueueName = "whatsapp:retry";

    public WhatsAppDispatcherWorker(IServiceProvider serviceProvider, ILogger<WhatsAppDispatcherWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("WhatsApp Dispatcher Worker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var queueService = scope.ServiceProvider.GetRequiredService<IQueueService>();

                // Check for scheduled retries first
                var scheduledMessages = await queueService.GetReadyScheduledMessagesAsync(RetryQueueName, stoppingToken);
                foreach (var scheduled in scheduledMessages)
                {
                    await ProcessMessageAsync(scheduled, scope, stoppingToken);
                }

                // Normal dequeue
                var message = await queueService.DequeueAsync(QueueName, stoppingToken);
                if (!string.IsNullOrEmpty(message))
                {
                    await ProcessMessageAsync(message, scope, stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the WhatsApp queue.");
                await Task.Delay(5000, stoppingToken);
            }
        }

        _logger.LogInformation("WhatsApp Dispatcher Worker is stopping.");
    }

    public async Task ProcessMessageAsync(string message, IServiceScope scope, CancellationToken cancellationToken)
    {
        var whatsappService = scope.ServiceProvider.GetRequiredService<IWhatsAppService>();
        var deliveryLogRepo = scope.ServiceProvider.GetRequiredService<IDeliveryLogRepository>();
        var queueService = scope.ServiceProvider.GetRequiredService<IQueueService>();

        WhatsAppMessagePayload? payload;
        try
        {
            payload = JsonSerializer.Deserialize<WhatsAppMessagePayload>(message, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
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
            string providerMessageId;
            if (string.IsNullOrEmpty(payload.TextMessage))
            {
                providerMessageId = await whatsappService.SendTemplateMessageAsync(payload.To, payload.TemplateName, payload.Variables, cancellationToken);
            }
            else
            {
                providerMessageId = await whatsappService.SendTextMessageAsync(payload.To, payload.TextMessage, cancellationToken);
            }

            _logger.LogInformation("Successfully sent WhatsApp message to {To}", payload.To);

            if (log != null && !string.IsNullOrEmpty(providerMessageId))
            {
                log.ProviderMessageId = providerMessageId;
                log.DeliveryStatus = DeliveryStatus.Sent;
                log.SentAt = DateTimeOffset.UtcNow;
                await deliveryLogRepo.UpdateAsync(log, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send WhatsApp message to {To} (Attempt {Attempt})", payload.To, payload.Attempt);

            payload.Attempt++;

            if (payload.Attempt <= 3)
            {
                // Retry logic: Attempt 2 (5 mins), Attempt 3 (30 mins)
                int delayMinutes = payload.Attempt == 2 ? 5 : 30;
                var visibilityTime = DateTimeOffset.UtcNow.AddMinutes(delayMinutes);
                
                var retryMessage = JsonSerializer.Serialize(payload);
                await queueService.ScheduleMessageAsync(RetryQueueName, retryMessage, visibilityTime, cancellationToken);
                
                if (log != null)
                {
                    log.RetryCount++;
                    log.FailureReason = ex.Message;
                    await deliveryLogRepo.UpdateAsync(log, cancellationToken);
                }
            }
            else
            {
                _logger.LogWarning("Max retries exceeded for {To}. Falling back to email.", payload.To);

                if (log != null)
                {
                    log.DeliveryStatus = DeliveryStatus.Failed;
                    log.FailedAt = DateTimeOffset.UtcNow;
                    log.FailureReason = $"WhatsApp failed after 2 retries. {ex.Message}";
                    await deliveryLogRepo.UpdateAsync(log, cancellationToken);
                }

                var fallbackPayload = new EmailMessagePayload
                {
                    Type = "invitation-fallback",
                    To = payload.To, // Might need real email mapping depending on requirements
                    TemplateName = payload.TemplateName,
                    Tokens = payload.Variables,
                    DeliveryLogId = payload.DeliveryLogId
                };

                var fallbackMessage = JsonSerializer.Serialize(fallbackPayload);
                await queueService.EnqueueAsync("email:queue", fallbackMessage, cancellationToken);
            }
        }
    }
}
