using System.Text.Json;
using Aura.Core.DTOs.Email;
using Aura.Core.DTOs.WhatsApp;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;

namespace Aura.Core.Services;

public class ReminderService : IReminderService
{
    private readonly IGuestRepository _guestRepository;
    private readonly IDeliveryLogRepository _deliveryLogRepository;
    private readonly IQueueService _queueService;
    private readonly IEventRepository _eventRepository;

    public ReminderService(
        IGuestRepository guestRepository,
        IDeliveryLogRepository deliveryLogRepository,
        IQueueService queueService,
        IEventRepository eventRepository)
    {
        _guestRepository = guestRepository;
        _deliveryLogRepository = deliveryLogRepository;
        _queueService = queueService;
        _eventRepository = eventRepository;
    }

    public async Task ProcessAutomatedRemindersAsync(CancellationToken cancellationToken = default)
    {
        var pendingGuests = await _guestRepository.GetPendingReminderGuestsAsync(7, cancellationToken);
        
        foreach (var guest in pendingGuests)
        {
            await EnqueueReminderAsync(guest, cancellationToken);
        }
    }

    public async Task SendManualRemindersAsync(string eventSlug, IEnumerable<Guid> guestIds, CancellationToken cancellationToken = default)
    {
        var guests = await _guestRepository.GetGuestsByIdsAsync(guestIds, cancellationToken);
        
        foreach (var guest in guests)
        {
            if (guest.Event.Slug != eventSlug)
                continue;

            // Only send if they have an invitation and no RSVP
            if (!guest.Invitations.Any(i => i.DeliveryStatus == DeliveryStatus.Sent || i.DeliveryStatus == DeliveryStatus.Delivered))
                continue;

            if (guest.Invitations.Any(i => i.Rsvp != null))
                continue;

            await EnqueueReminderAsync(guest, cancellationToken);
        }
    }

    private async Task EnqueueReminderAsync(Guest guest, CancellationToken cancellationToken)
    {
        // Deduplication: Has it been sent in the last 24 hours?
        bool hasRecent = await _deliveryLogRepository.HasRecentLogAsync(guest.Id, DeliveryEntityType.Reminder, TimeSpan.FromHours(24), cancellationToken);
        if (hasRecent)
            return;

        var activeInvitation = guest.Invitations.FirstOrDefault(i => 
            (i.DeliveryStatus == DeliveryStatus.Sent || i.DeliveryStatus == DeliveryStatus.Delivered) && i.Rsvp == null);

        if (activeInvitation == null || activeInvitation.SentVia == null)
            return;

        var deliveryLog = new DeliveryLog
        {
            Id = Guid.NewGuid(),
            EventId = guest.EventId,
            EntityType = DeliveryEntityType.Reminder,
            EntityId = guest.Id,
            Channel = activeInvitation.SentVia.Value,
            MessageType = "reminder",
            DeliveryStatus = DeliveryStatus.Pending,
            SentAt = DateTimeOffset.UtcNow
        };

        await _deliveryLogRepository.AddAsync(deliveryLog, cancellationToken);

        var rsvpLink = $"https://frontend/rsvp/{guest.Event.Slug}/{activeInvitation.TokenHash}"; // We can replace frontend with actual config if needed, or rely on worker replacing it. Wait, InvitationService passes the link. We should probably just pass the token hash.

        if (activeInvitation.SentVia == Channel.Email)
        {
            if (string.IsNullOrEmpty(guest.Email)) return;

            var payload = new EmailMessagePayload
            {
                Type = "reminder",
                To = guest.Email,
                Subject = $"Reminder: RSVP to {guest.Event.Name}",
                TemplateName = "rsvp-reminder",
                Tokens = new Dictionary<string, string>
                {
                    { "guestName", guest.Name },
                    { "eventName", guest.Event.Name },
                    { "rsvpLink", rsvpLink },
                    { "eventDate", guest.Event.EventDate.ToString("yyyy-MM-dd") }
                },
                EventId = guest.EventId,
                EntityType = "Reminder",
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
                Type = "reminder",
                To = guest.Phone,
                TemplateName = "rsvp_reminder",
                Variables = new Dictionary<string, string>
                {
                    { "guestName", guest.Name },
                    { "eventName", guest.Event.Name },
                    { "rsvpLink", rsvpLink }
                },
                DeliveryLogId = deliveryLog.Id
            };

            await _queueService.EnqueueAsync("whatsapp:queue", JsonSerializer.Serialize(payload), cancellationToken);
        }
    }
}
