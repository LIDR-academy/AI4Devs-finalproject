using System.Security.Cryptography;
using System.Text;
using Aura.Core.DTOs.Rsvp;
using Aura.Core.Enums;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Core.Services;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace Aura.Core.Tests.Services;

public class RsvpServiceTests
{
    private readonly IInvitationRepository _invitationRepository;
    private readonly IRsvpRepository _rsvpRepository;
    private readonly RsvpService _sut;

    public RsvpServiceTests()
    {
        _invitationRepository = Substitute.For<IInvitationRepository>();
        _rsvpRepository = Substitute.For<IRsvpRepository>();
        _sut = new RsvpService(_invitationRepository, _rsvpRepository);
    }

    [Fact]
    public async Task GetRsvpInfoAsync_ValidToken_ReturnsInfo()
    {
        var token = "valid-token";
        var hash = ComputeSha256Hash(token);
        
        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            TokenHash = hash,
            Event = new Event { Name = "Wedding", CoupleNames = "Alice & Bob", EventDate = DateTimeOffset.UtcNow.AddDays(10) },
            Guest = new Guest { Name = "Charlie" }
        };

        _invitationRepository.GetByTokenHashAsync(hash, Arg.Any<CancellationToken>()).Returns(invitation);

        var result = await _sut.GetRsvpInfoAsync(token);

        result.Should().NotBeNull();
        result.GuestName.Should().Be("Charlie");
        result.DeadlinePassed.Should().BeFalse();
    }

    [Fact]
    public async Task GetRsvpInfoAsync_DeadlinePassed_ReturnsTrue()
    {
        var token = "valid-token";
        var hash = ComputeSha256Hash(token);
        
        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            TokenHash = hash,
            Event = new Event { Name = "Wedding", CoupleNames = "Alice & Bob", EventDate = DateTimeOffset.UtcNow.AddDays(5) }, // Deadline is EventDate - 7 days, so 5 days means passed
            Guest = new Guest { Name = "Charlie" }
        };

        _invitationRepository.GetByTokenHashAsync(hash, Arg.Any<CancellationToken>()).Returns(invitation);

        var result = await _sut.GetRsvpInfoAsync(token);

        result.DeadlinePassed.Should().BeTrue();
    }

    [Fact]
    public async Task SubmitRsvpAsync_InvalidToken_ThrowsNotFound()
    {
        var request = new SubmitRsvpRequest(RsvpAttendance.Yes, null, false, false, null, null);
        await _sut.Invoking(s => s.SubmitRsvpAsync("invalid", request))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task SubmitRsvpAsync_ValidTokenAndNoExistingRsvp_AddsNewRsvp()
    {
        var token = "valid-token";
        var hash = ComputeSha256Hash(token);
        
        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            GuestId = Guid.NewGuid(),
            EventId = Guid.NewGuid(),
            TokenHash = hash,
            Event = new Event { Name = "Wedding", EventDate = DateTimeOffset.UtcNow.AddDays(10) },
            Guest = new Guest { Name = "Charlie" }
        };

        _invitationRepository.GetByTokenHashAsync(hash, Arg.Any<CancellationToken>()).Returns(invitation);

        var request = new SubmitRsvpRequest(RsvpAttendance.Yes, "Vegan", false, true, "Alice", "Congrats!");

        var result = await _sut.SubmitRsvpAsync(token, request);

        await _rsvpRepository.Received(1).AddAsync(Arg.Is<Rsvp>(r =>
            r.Attendance == RsvpAttendance.Yes &&
            r.DietaryRestrictions == "Vegan" &&
            r.PlusOne == true &&
            r.Message == "Congrats!"
        ), Arg.Any<CancellationToken>());

        result.Attendance.Should().Be(RsvpAttendance.Yes);
        result.GuestName.Should().Be("Charlie");
    }

    [Fact]
    public async Task SubmitRsvpAsync_ExistingRsvp_UpdatesRsvp()
    {
        var token = "valid-token";
        var hash = ComputeSha256Hash(token);
        
        var existingRsvp = new Rsvp
        {
            Id = Guid.NewGuid(),
            Attendance = RsvpAttendance.No
        };

        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            TokenHash = hash,
            Event = new Event { Name = "Wedding", EventDate = DateTimeOffset.UtcNow.AddDays(10) },
            Guest = new Guest { Name = "Charlie" },
            Rsvp = existingRsvp
        };

        _invitationRepository.GetByTokenHashAsync(hash, Arg.Any<CancellationToken>()).Returns(invitation);

        var request = new SubmitRsvpRequest(RsvpAttendance.Yes, null, false, false, null, null);

        await _sut.SubmitRsvpAsync(token, request);

        await _rsvpRepository.Received(1).UpdateAsync(Arg.Is<Rsvp>(r => r.Attendance == RsvpAttendance.Yes), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SubmitRsvpAsync_DeadlinePassed_ThrowsForbidden()
    {
        var token = "valid-token";
        var hash = ComputeSha256Hash(token);
        
        var invitation = new Invitation
        {
            Id = Guid.NewGuid(),
            TokenHash = hash,
            Event = new Event { Name = "Wedding", EventDate = DateTimeOffset.UtcNow.AddDays(5) },
            Guest = new Guest { Name = "Charlie" }
        };

        _invitationRepository.GetByTokenHashAsync(hash, Arg.Any<CancellationToken>()).Returns(invitation);

        var request = new SubmitRsvpRequest(RsvpAttendance.Yes, null, false, false, null, null);

        await _sut.Invoking(s => s.SubmitRsvpAsync(token, request))
            .Should().ThrowAsync<ForbiddenAccessException>();
    }

    private string ComputeSha256Hash(string rawData)
    {
        using (SHA256 sha256Hash = SHA256.Create())
        {
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < bytes.Length; i++)
            {
                builder.Append(bytes[i].ToString("x2"));
            }
            return builder.ToString();
        }
    }
}
