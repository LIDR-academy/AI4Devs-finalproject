using System.Text.Json;
using Aura.Core.DTOs.LiveMessages;
using Aura.Core.DTOs.WhatsApp;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;

namespace Aura.Core.Services;

public class LiveMessageService : ILiveMessageService
{
    private readonly ILiveMessageRepository _liveMessageRepository;
    private readonly IAccompliceRepository _accompliceRepository;
    private readonly IMessageTemplateRepository _messageTemplateRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IGuestRepository _guestRepository;
    private readonly IDeliveryLogRepository _deliveryLogRepository;
    private readonly IQueueService _queueService;
    private readonly IRateLimitingService _rateLimitingService;

    public LiveMessageService(
        ILiveMessageRepository liveMessageRepository,
        IAccompliceRepository accompliceRepository,
        IMessageTemplateRepository messageTemplateRepository,
        IEventRepository eventRepository,
        IGuestRepository guestRepository,
        IDeliveryLogRepository deliveryLogRepository,
        IQueueService queueService,
        IRateLimitingService rateLimitingService)
    {
        _liveMessageRepository = liveMessageRepository;
        _accompliceRepository = accompliceRepository;
        _messageTemplateRepository = messageTemplateRepository;
        _eventRepository = eventRepository;
        _guestRepository = guestRepository;
        _deliveryLogRepository = deliveryLogRepository;
        _queueService = queueService;
        _rateLimitingService = rateLimitingService;
    }

    public async Task<LiveMessageResponse> SendLiveMessageAsync(string accompliceToken, SendLiveMessageRequest request, CancellationToken cancellationToken = default)
    {
        var accomplice = await _accompliceRepository.GetByTokenAsync(accompliceToken, cancellationToken);

        if (accomplice == null || accomplice.IsRevoked || accomplice.ExpiresAt < DateTimeOffset.UtcNow)
        {
            throw new UnauthorizedAccessException("Invalid, revoked, or expired accomplice token.");
        }

        if (!accomplice.Permissions.Contains("\"send_messages\""))
        {
            throw new UnauthorizedAccessException("Accomplice does not have permission to send messages.");
        }

        var rateLimitKey = $"ratelimit:accomplice:{accomplice.Id}:messages";
        var isLimited = await _rateLimitingService.IsRateLimitedAsync(rateLimitKey, 20, TimeSpan.FromHours(1), cancellationToken);

        if (isLimited)
        {
            throw new InvalidOperationException("Rate limit exceeded: You can only send 20 messages per hour.");
        }

        var template = await _messageTemplateRepository.GetByIdAsync(request.MessageTemplateId, cancellationToken);
        if (template == null || template.EventId != accomplice.EventId || template.IsDeleted)
        {
            throw new NotFoundException("Message template not found or not associated with your event.");
        }

        var liveMessage = new LiveMessage
        {
            EventId = accomplice.EventId,
            AccompliceId = accomplice.Id,
            MessageTemplateId = template.Id,
            CustomMessage = request.CustomMessage,
            SentVia = Aura.Core.Enums.Channel.WhatsApp,
            SentAt = DateTimeOffset.UtcNow,
            DeliveryStatus = Aura.Core.Enums.DeliveryStatus.Pending
        };

        await _liveMessageRepository.AddAsync(liveMessage, cancellationToken);

        var guests = await _guestRepository.GetGuestsByEventAsync(accomplice.EventId);
        var guestsWithPhones = guests.Where(g => !string.IsNullOrEmpty(g.Phone)).ToList();

        foreach (var guest in guestsWithPhones)
        {
            var deliveryLog = new DeliveryLog
            {
                EventId = accomplice.EventId,
                EntityType = Aura.Core.Enums.DeliveryEntityType.LiveMessage,
                EntityId = liveMessage.Id,
                Channel = Aura.Core.Enums.Channel.WhatsApp,
                MessageType = "live_update"
            };
            await _deliveryLogRepository.AddAsync(deliveryLog, cancellationToken);

            var payload = new WhatsAppMessagePayload
            {
                Type = "template",
                To = guest.Phone!,
                TemplateName = "live_update",
                Variables = new Dictionary<string, string>
                {
                    { "message", request.CustomMessage ?? template.DefaultMessage }
                },
                DeliveryLogId = deliveryLog.Id
            };

            var serializedPayload = JsonSerializer.Serialize(payload);
            await _queueService.EnqueueAsync("whatsapp:queue", serializedPayload, cancellationToken);
        }

        return new LiveMessageResponse
        {
            Id = liveMessage.Id,
            EventId = liveMessage.EventId,
            AccompliceId = liveMessage.AccompliceId,
            MessageTemplateId = liveMessage.MessageTemplateId,
            CustomMessage = liveMessage.CustomMessage,
            SentVia = liveMessage.SentVia,
            SentAt = liveMessage.SentAt,
            DeliveryStatus = liveMessage.DeliveryStatus
        };
    }

    public async Task<IEnumerable<LiveMessageResponse>> GetLiveMessagesByEventAsync(string eventSlug, CancellationToken cancellationToken = default)
    {
        var ev = await _eventRepository.GetBySlugAsync(eventSlug);
        if (ev == null)
        {
            throw new NotFoundException($"Event with slug {eventSlug} not found.");
        }

        var messages = await _liveMessageRepository.GetByEventIdAsync(ev.Id, cancellationToken);

        return messages.OrderByDescending(m => m.SentAt).Select(m => new LiveMessageResponse
        {
            Id = m.Id,
            EventId = m.EventId,
            AccompliceId = m.AccompliceId,
            MessageTemplateId = m.MessageTemplateId,
            CustomMessage = m.CustomMessage,
            SentVia = m.SentVia,
            SentAt = m.SentAt,
            DeliveryStatus = m.DeliveryStatus
        });
    }
}
