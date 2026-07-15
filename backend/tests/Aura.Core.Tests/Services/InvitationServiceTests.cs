using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Email;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Aura.Core.Services;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using Xunit;

namespace Aura.Core.Tests.Services;

public class InvitationServiceTests
{
    private readonly IEventRepository _mockEventRepository;
    private readonly IGuestRepository _mockGuestRepository;
    private readonly IInvitationRepository _mockInvitationRepository;
    private readonly IQueueService _mockQueueService;
    private readonly IConfiguration _mockConfiguration;
    private readonly InvitationService _sut;

    public InvitationServiceTests()
    {
        _mockEventRepository = Substitute.For<IEventRepository>();
        _mockGuestRepository = Substitute.For<IGuestRepository>();
        _mockInvitationRepository = Substitute.For<IInvitationRepository>();
        _mockQueueService = Substitute.For<IQueueService>();
        _mockConfiguration = Substitute.For<IConfiguration>();

        _mockConfiguration["FrontendBaseUrl"].Returns("http://localhost:4200");

        _sut = new InvitationService(
            _mockEventRepository,
            _mockGuestRepository,
            _mockInvitationRepository,
            _mockQueueService,
            _mockConfiguration
        );
    }

    [Fact]
    public async Task SendInvitationsAsync_ShouldGenerateTokensAndEnqueueMessages()
    {
        // Arrange
        var evt = new Event { Id = Guid.NewGuid(), Name = "Test Event", Slug = "test-event" };
        var guest1 = new Guest { Id = Guid.NewGuid(), Name = "John Doe", Email = "john@example.com" };
        var guest2 = new Guest { Id = Guid.NewGuid(), Name = "Jane Doe", Email = "jane@example.com" };

        _mockEventRepository.GetBySlugAsync("test-event").Returns(evt);
        _mockGuestRepository.GetGuestsByEventAsync(evt.Id).Returns(new List<Guest> { guest1, guest2 });
        _mockInvitationRepository.GetAllAsync(Arg.Any<CancellationToken>()).Returns(new List<Invitation>());

        var addedInvitations = new List<Invitation>();
        _mockInvitationRepository.When(r => r.AddAsync(Arg.Any<Invitation>(), Arg.Any<CancellationToken>()))
            .Do(callInfo => addedInvitations.Add(callInfo.Arg<Invitation>()));

        var enqueuedMessages = new List<string>();
        _mockQueueService.When(q => q.EnqueueAsync("email:queue", Arg.Any<string>()))
            .Do(callInfo => enqueuedMessages.Add(callInfo.ArgAt<string>(1)));

        // Act
        await _sut.SendInvitationsAsync("test-event");

        // Assert
        Assert.Equal(2, addedInvitations.Count);
        Assert.Equal(2, enqueuedMessages.Count);

        var inv1 = addedInvitations.FirstOrDefault(i => i.GuestId == guest1.Id);
        Assert.NotNull(inv1);
        Assert.NotNull(inv1.TokenHash);

        var msg1 = enqueuedMessages.FirstOrDefault(m => m.Contains(guest1.Email));
        Assert.NotNull(msg1);

        var payload1 = JsonSerializer.Deserialize<EmailMessagePayload>(msg1);
        Assert.NotNull(payload1);
        Assert.Equal("invitation", payload1.Type);
        Assert.Equal(guest1.Email, payload1.To);
        Assert.Contains("rsvpLink", payload1.Tokens.Keys);
        Assert.Contains("http://localhost:4200/rsvp/", payload1.Tokens["rsvpLink"]);
    }

    [Fact]
    public async Task SendInvitationsAsync_ShouldSkipGuestsWithExistingInvitations()
    {
        // Arrange
        var evt = new Event { Id = Guid.NewGuid(), Name = "Test Event", Slug = "test-event" };
        var guest1 = new Guest { Id = Guid.NewGuid(), Name = "John Doe", Email = "john@example.com" };
        var guest2 = new Guest { Id = Guid.NewGuid(), Name = "Jane Doe", Email = "jane@example.com" };

        var existingInv = new Invitation { Id = Guid.NewGuid(), EventId = evt.Id, GuestId = guest1.Id, TokenHash = "hash" };

        _mockEventRepository.GetBySlugAsync("test-event").Returns(evt);
        _mockGuestRepository.GetGuestsByEventAsync(evt.Id).Returns(new List<Guest> { guest1, guest2 });
        _mockInvitationRepository.GetAllAsync(Arg.Any<CancellationToken>()).Returns(new List<Invitation> { existingInv });

        // Act
        await _sut.SendInvitationsAsync("test-event");

        // Assert
        await _mockInvitationRepository.Received(1).AddAsync(Arg.Is<Invitation>(i => i.GuestId == guest2.Id), Arg.Any<CancellationToken>());
        await _mockInvitationRepository.DidNotReceive().AddAsync(Arg.Is<Invitation>(i => i.GuestId == guest1.Id), Arg.Any<CancellationToken>());
        
        await _mockQueueService.Received(1).EnqueueAsync("email:queue", Arg.Is<string>(s => s.Contains("jane@example.com")));
        await _mockQueueService.DidNotReceive().EnqueueAsync("email:queue", Arg.Is<string>(s => s.Contains("john@example.com")));
    }
}
