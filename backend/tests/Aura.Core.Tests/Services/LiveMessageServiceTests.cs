using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.LiveMessages;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Aura.Core.Services;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace Aura.Core.Tests.Services;

public class LiveMessageServiceTests
{
    private readonly ILiveMessageRepository _liveMessageRepoMock;
    private readonly IAccompliceRepository _accompliceRepoMock;
    private readonly IMessageTemplateRepository _templateRepoMock;
    private readonly IEventRepository _eventRepoMock;
    private readonly IGuestRepository _guestRepoMock;
    private readonly IDeliveryLogRepository _logRepoMock;
    private readonly IQueueService _queueMock;
    private readonly IRateLimitingService _rateLimiterMock;
    private readonly LiveMessageService _sut;

    public LiveMessageServiceTests()
    {
        _liveMessageRepoMock = Substitute.For<ILiveMessageRepository>();
        _accompliceRepoMock = Substitute.For<IAccompliceRepository>();
        _templateRepoMock = Substitute.For<IMessageTemplateRepository>();
        _eventRepoMock = Substitute.For<IEventRepository>();
        _guestRepoMock = Substitute.For<IGuestRepository>();
        _logRepoMock = Substitute.For<IDeliveryLogRepository>();
        _queueMock = Substitute.For<IQueueService>();
        _rateLimiterMock = Substitute.For<IRateLimitingService>();

        _sut = new LiveMessageService(
            _liveMessageRepoMock,
            _accompliceRepoMock,
            _templateRepoMock,
            _eventRepoMock,
            _guestRepoMock,
            _logRepoMock,
            _queueMock,
            _rateLimiterMock);
    }

    [Fact]
    public async Task SendLiveMessageAsync_InvalidToken_ThrowsUnauthorized()
    {
        // Arrange
        _accompliceRepoMock.GetByIdAsync(Guid.Empty, Arg.Any<CancellationToken>())
            .Returns((Accomplice?)null);

        _eventRepoMock.GetBySlugAsync("test-event").Returns(new Event { Id = Guid.NewGuid(), Slug = "test-event" });

        // Act
        Func<Task> act = async () => await _sut.SendLiveMessageAsync(Guid.Empty, "test-event", new SendLiveMessageRequest());

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task SendLiveMessageAsync_NoPermission_ThrowsUnauthorized()
    {
        // Arrange
        var evId = Guid.NewGuid();
        var accompliceId = Guid.NewGuid();
        var accomplice = new Accomplice { Id = accompliceId, EventId = evId, TokenHash = "valid", Permissions = "[]", ExpiresAt = DateTimeOffset.UtcNow.AddDays(1) };
        
        _eventRepoMock.GetBySlugAsync("test-event").Returns(new Event { Id = evId, Slug = "test-event" });
        _accompliceRepoMock.GetByIdAsync(accompliceId, Arg.Any<CancellationToken>()).Returns(accomplice);

        // Act
        Func<Task> act = async () => await _sut.SendLiveMessageAsync(accompliceId, "test-event", new SendLiveMessageRequest());

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task SendLiveMessageAsync_RateLimitExceeded_ThrowsInvalidOperationException()
    {
        // Arrange
        var evId = Guid.NewGuid();
        var accompliceId = Guid.NewGuid();
        var accomplice = new Accomplice { Id = accompliceId, EventId = evId, TokenHash = "valid", Permissions = "[\"send_messages\"]", ExpiresAt = DateTimeOffset.UtcNow.AddDays(1) };
        
        _eventRepoMock.GetBySlugAsync("test-event").Returns(new Event { Id = evId, Slug = "test-event" });
        _accompliceRepoMock.GetByIdAsync(accompliceId, Arg.Any<CancellationToken>()).Returns(accomplice);
        _rateLimiterMock.IsRateLimitedAsync(Arg.Any<string>(), 20, Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        Func<Task> act = async () => await _sut.SendLiveMessageAsync(accompliceId, "test-event", new SendLiveMessageRequest());

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task SendLiveMessageAsync_Valid_SendsToQueue()
    {
        // Arrange
        var evId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var accompliceId = Guid.NewGuid();
        var accomplice = new Accomplice { Id = accompliceId, EventId = evId, TokenHash = "valid", Permissions = "[\"send_messages\"]", ExpiresAt = DateTimeOffset.UtcNow.AddDays(1) };
        var template = new MessageTemplate { Id = templateId, EventId = evId, DefaultMessage = "Hello" };
        
        _eventRepoMock.GetBySlugAsync("test-event").Returns(new Event { Id = evId, Slug = "test-event" });
        _accompliceRepoMock.GetByIdAsync(accompliceId, Arg.Any<CancellationToken>()).Returns(accomplice);
        _rateLimiterMock.IsRateLimitedAsync(Arg.Any<string>(), 20, Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>()).Returns(false);
        _templateRepoMock.GetByIdAsync(templateId, Arg.Any<CancellationToken>()).Returns(template);
        _guestRepoMock.GetGuestsByEventAsync(evId).Returns(new List<Guest> { new Guest { Phone = "123456" } });

        // Act
        var result = await _sut.SendLiveMessageAsync(accompliceId, "test-event", new SendLiveMessageRequest { MessageTemplateId = templateId });

        // Assert
        result.Should().NotBeNull();
        await _queueMock.Received(1).EnqueueAsync("whatsapp:queue", Arg.Any<string>(), Arg.Any<CancellationToken>());
    }
}
