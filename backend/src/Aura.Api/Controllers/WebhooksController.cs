using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebhooksController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IDeliveryLogRepository _deliveryLogRepository;
    private readonly IInvitationRepository _invitationRepository;
    private readonly ILogger<WebhooksController> _logger;

    public WebhooksController(
        IConfiguration configuration,
        IDeliveryLogRepository deliveryLogRepository,
        IInvitationRepository invitationRepository,
        ILogger<WebhooksController> logger)
    {
        _configuration = configuration;
        _deliveryLogRepository = deliveryLogRepository;
        _invitationRepository = invitationRepository;
        _logger = logger;
    }

    [HttpGet("whatsapp")]
    public IActionResult VerifyWhatsAppWebhook(
        [FromQuery(Name = "hub.mode")] string? mode,
        [FromQuery(Name = "hub.verify_token")] string? verifyToken,
        [FromQuery(Name = "hub.challenge")] string? challenge)
    {
        var expectedToken = _configuration["WhatsApp:VerifyToken"];

        if (mode == "subscribe" && verifyToken == expectedToken)
        {
            _logger.LogInformation("WhatsApp webhook verified successfully.");
            return Ok(challenge);
        }

        _logger.LogWarning("WhatsApp webhook verification failed.");
        return Forbid();
    }

    [HttpPost("whatsapp")]
    public async Task<IActionResult> ReceiveWhatsAppWebhook()
    {
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var body = await reader.ReadToEndAsync();

        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.TryGetProperty("entry", out var entries))
            {
                foreach (var entry in entries.EnumerateArray())
                {
                    if (entry.TryGetProperty("changes", out var changes))
                    {
                        foreach (var change in changes.EnumerateArray())
                        {
                            if (change.TryGetProperty("value", out var value) && value.TryGetProperty("statuses", out var statuses))
                            {
                                foreach (var status in statuses.EnumerateArray())
                                {
                                    await ProcessDeliveryStatusAsync(status);
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing WhatsApp webhook payload.");
            return BadRequest();
        }

        return Ok();
    }

    private async Task ProcessDeliveryStatusAsync(JsonElement statusElement)
    {
        if (!statusElement.TryGetProperty("id", out var idProp) || !statusElement.TryGetProperty("status", out var statusProp))
        {
            return;
        }

        var messageId = idProp.GetString();
        var statusStr = statusProp.GetString();
        var timestampStr = statusElement.TryGetProperty("timestamp", out var tsProp) ? tsProp.GetString() : null;

        if (string.IsNullOrEmpty(messageId) || string.IsNullOrEmpty(statusStr))
        {
            return;
        }

        var log = await _deliveryLogRepository.GetByProviderMessageIdAsync(messageId);
        if (log == null)
        {
            _logger.LogWarning("DeliveryLog not found for provider message id: {MessageId}", messageId);
            return;
        }

        DateTimeOffset timestamp = DateTimeOffset.UtcNow;
        if (long.TryParse(timestampStr, out var unixTimestamp))
        {
            timestamp = DateTimeOffset.FromUnixTimeSeconds(unixTimestamp);
        }

        var newStatus = MapMetaStatus(statusStr);

        // Only update if it's progressing correctly (avoid older webhooks overriding newer ones if they arrive out of order)
        if (newStatus > log.DeliveryStatus)
        {
            log.DeliveryStatus = newStatus;
            
            if (newStatus == DeliveryStatus.Delivered || newStatus == DeliveryStatus.Opened)
            {
                log.DeliveredAt = timestamp;
            }
            else if (newStatus == DeliveryStatus.Failed)
            {
                log.FailedAt = timestamp;
                
                if (statusElement.TryGetProperty("errors", out var errors) && errors.GetArrayLength() > 0)
                {
                    log.FailureReason = errors[0].TryGetProperty("title", out var titleProp) ? titleProp.GetString() : "Unknown Error";
                }
            }

            await _deliveryLogRepository.UpdateAsync(log);

            if (log.EntityType == DeliveryEntityType.Invitation)
            {
                var invitation = await _invitationRepository.GetByIdAsync(log.EntityId);
                if (invitation != null && newStatus > invitation.DeliveryStatus)
                {
                    invitation.DeliveryStatus = newStatus;
                    await _invitationRepository.UpdateAsync(invitation);
                }
            }
        }
    }

    private DeliveryStatus MapMetaStatus(string status)
    {
        return status.ToLowerInvariant() switch
        {
            "sent" => DeliveryStatus.Sent,
            "delivered" => DeliveryStatus.Delivered,
            "read" => DeliveryStatus.Opened,
            "failed" => DeliveryStatus.Failed,
            _ => DeliveryStatus.Pending
        };
    }
}
