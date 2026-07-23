using System.Text.Json;
using Aura.Core.DTOs.Email;
using Aura.Core.DTOs.WhatsApp;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;

namespace Aura.Core.Services;

public class ThankYouCardService : IThankYouCardService
{
    private readonly IGuestRepository _guestRepository;
    private readonly IDeliveryLogRepository _deliveryLogRepository;
    private readonly IQueueService _queueService;

    public ThankYouCardService(
        IGuestRepository guestRepository,
        IDeliveryLogRepository deliveryLogRepository,
        IQueueService queueService)
    {
        _guestRepository = guestRepository;
        _deliveryLogRepository = deliveryLogRepository;
        _queueService = queueService;
    }

    public async Task ProcessAutomatedThankYouCardsAsync(CancellationToken cancellationToken = default)
    {
        var eligibleGuests = await _guestRepository.GetGuestsForThankYouCardsAsync(cancellationToken);
        
        foreach (var guest in eligibleGuests)
        {
            await EnqueueThankYouCardAsync(guest, cancellationToken);
        }
    }

    private async Task EnqueueThankYouCardAsync(Guest guest, CancellationToken cancellationToken)
    {
        // Deduplication: Has it been sent ever for this event? (or just in the last 24h as a safeguard)
        bool hasBeenSent = await _deliveryLogRepository.HasRecentLogAsync(guest.Id, DeliveryEntityType.ThankYou, TimeSpan.FromDays(30), cancellationToken);
        if (hasBeenSent)
            return;

        var activeInvitation = guest.Invitations.FirstOrDefault(i => i.Rsvp != null && i.Rsvp.Attendance == AttendanceStatus.Yes);

        if (activeInvitation == null || activeInvitation.SentVia == null)
            return;

        var deliveryLog = new DeliveryLog
        {
            Id = Guid.NewGuid(),
            EventId = guest.EventId,
            EntityType = DeliveryEntityType.ThankYou,
            EntityId = guest.Id,
            Channel = activeInvitation.SentVia.Value,
            MessageType = "thank_you",
            DeliveryStatus = DeliveryStatus.Pending,
            SentAt = DateTimeOffset.UtcNow
        };

        await _deliveryLogRepository.AddAsync(deliveryLog, cancellationToken);

        string customMessage = !string.IsNullOrWhiteSpace(guest.Event.ThankYouMessage) 
            ? guest.Event.ThankYouMessage 
            : "Thank you for celebrating with us!";

        if (activeInvitation.SentVia == Channel.Email)
        {
            if (string.IsNullOrEmpty(guest.Email)) return;

            var payload = new EmailMessagePayload
            {
                Type = "thank_you",
                To = guest.Email,
                Subject = $"Thank you from {guest.Event.CoupleNames}",
                TemplateName = "thank-you-card",
                Tokens = new Dictionary<string, string>
                {
                    { "guestName", guest.Name },
                    { "eventName", guest.Event.Name },
                    { "coupleNames", guest.Event.CoupleNames },
                    { "customMessage", customMessage },
                    { "photoGalleryLink", guest.Event.PhotoGalleryUrl ?? "" }
                },
                EventId = guest.EventId,
                EntityType = "ThankYou",
                EntityId = guest.Id,
                DeliveryLogId = deliveryLog.Id
            };

            await _queueService.EnqueueAsync("email:queue", JsonSerializer.Serialize(payload), cancellationToken);
        }
        else if (activeInvitation.SentVia == Channel.WhatsApp)
        {
            if (string.IsNullOrEmpty(guest.Phone)) return;

            var payload = new WhatsAppMessagePayload
            {
                Type = "thank_you",
                To = guest.Phone,
                TemplateName = "thank_you",
                Variables = new Dictionary<string, string>
                {
                    { "guestName", guest.Name },
                    { "eventName", guest.Event.Name },
                    { "customMessage", customMessage },
                    { "photoGalleryLink", guest.Event.PhotoGalleryUrl ?? "" }
                },
                DeliveryLogId = deliveryLog.Id
            };

            await _queueService.EnqueueAsync("whatsapp:queue", JsonSerializer.Serialize(payload), cancellationToken);
        }
    }
}
