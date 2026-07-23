using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Email;
using Aura.Core.DTOs.WhatsApp;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Aura.Core.Services;
using NSubstitute;
using Xunit;

namespace Aura.Core.Tests.Services;

public class ReminderServiceTests
{
    private readonly IGuestRepository _guestRepository;
    private readonly IDeliveryLogRepository _deliveryLogRepository;
    private readonly IQueueService _queueService;
    private readonly IEventRepository _eventRepository;
    private readonly ReminderService _reminderService;

    public ReminderServiceTests()
    {
        _guestRepository = Substitute.For<IGuestRepository>();
        _deliveryLogRepository = Substitute.For<IDeliveryLogRepository>();
        _queueService = Substitute.For<IQueueService>();
        _eventRepository = Substitute.For<IEventRepository>();

        _reminderService = new ReminderService(
            _guestRepository,
            _deliveryLogRepository,
            _queueService,
            _eventRepository
        );
    }

    [Fact]
    public async Task ProcessAutomatedRemindersAsync_ShouldEnqueueEmailReminder_WhenGuestHasEmailInvitation()
    {
        // Arrange
        var guest = new Guest
        {
            Id = Guid.NewGuid(),
            Name = "John Doe",
            Email = "john@example.com",
            EventId = Guid.NewGuid(),
            Event = new Event { Id = Guid.NewGuid(), Name = "My Event", Slug = "my-event", EventDate = DateTimeOffset.UtcNow.AddDays(5) },
            Invitations = new List<Invitation>
            {
                new Invitation { Id = Guid.NewGuid(), DeliveryStatus = DeliveryStatus.Sent, SentVia = Channel.Email, TokenHash = "hash123" }
            }
        };

        _guestRepository.GetPendingReminderGuestsAsync(7, Arg.Any<CancellationToken>())
            .Returns(new List<Guest> { guest });

        _deliveryLogRepository.HasRecentLogAsync(guest.Id, DeliveryEntityType.Reminder, Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        await _reminderService.ProcessAutomatedRemindersAsync();

        // Assert
        await _queueService.Received(1).EnqueueAsync("email:queue", Arg.Is<string>(s => s.Contains("john@example.com") && s.Contains("rsvp-reminder")), Arg.Any<CancellationToken>());
        await _deliveryLogRepository.Received(1).AddAsync(Arg.Is<DeliveryLog>(l => l.EntityType == DeliveryEntityType.Reminder && l.Channel == Channel.Email), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProcessAutomatedRemindersAsync_ShouldNotEnqueue_WhenRecentReminderExists()
    {
        // Arrange
        var guest = new Guest
        {
            Id = Guid.NewGuid(),
            Name = "John Doe",
            Email = "john@example.com",
            EventId = Guid.NewGuid(),
            Event = new Event { Id = Guid.NewGuid(), Name = "My Event", Slug = "my-event" },
            Invitations = new List<Invitation>
            {
                new Invitation { Id = Guid.NewGuid(), DeliveryStatus = DeliveryStatus.Sent, SentVia = Channel.Email }
            }
        };

        _guestRepository.GetPendingReminderGuestsAsync(7, Arg.Any<CancellationToken>())
            .Returns(new List<Guest> { guest });

        _deliveryLogRepository.HasRecentLogAsync(guest.Id, DeliveryEntityType.Reminder, Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>())
            .Returns(true); // Sent recently!

        // Act
        await _reminderService.ProcessAutomatedRemindersAsync();

        // Assert
        await _queueService.DidNotReceive().EnqueueAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _deliveryLogRepository.DidNotReceive().AddAsync(Arg.Any<DeliveryLog>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SendManualRemindersAsync_ShouldEnqueueWhatsAppReminder()
    {
        // Arrange
        var guestId = Guid.NewGuid();
        var guest = new Guest
        {
            Id = guestId,
            Name = "Jane Doe",
            Phone = "+123456789",
            EventId = Guid.NewGuid(),
            Event = new Event { Id = Guid.NewGuid(), Name = "My Event", Slug = "my-event" },
            Invitations = new List<Invitation>
            {
                new Invitation { Id = Guid.NewGuid(), DeliveryStatus = DeliveryStatus.Delivered, SentVia = Channel.WhatsApp, TokenHash = "hash456" }
            }
        };

        _guestRepository.GetGuestsByIdsAsync(Arg.Any<IEnumerable<Guid>>(), Arg.Any<CancellationToken>())
            .Returns(new List<Guest> { guest });

        _deliveryLogRepository.HasRecentLogAsync(guest.Id, DeliveryEntityType.Reminder, Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        await _reminderService.SendManualRemindersAsync("my-event", new[] { guestId });

        // Assert
        await _queueService.Received(1).EnqueueAsync("whatsapp:queue", Arg.Is<string>(s => s.Contains("123456789") && s.Contains("rsvp_reminder")), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SendManualRemindersAsync_ShouldSkip_WhenWrongEventSlug()
    {
        // Arrange
        var guestId = Guid.NewGuid();
        var guest = new Guest
        {
            Id = guestId,
            Event = new Event { Slug = "other-event" },
            Invitations = new List<Invitation> { new Invitation { DeliveryStatus = DeliveryStatus.Sent } }
        };

        _guestRepository.GetGuestsByIdsAsync(Arg.Any<IEnumerable<Guid>>(), Arg.Any<CancellationToken>())
            .Returns(new List<Guest> { guest });

        // Act
        await _reminderService.SendManualRemindersAsync("my-event", new[] { guestId });

        // Assert
        await _queueService.DidNotReceive().EnqueueAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
    }
}
