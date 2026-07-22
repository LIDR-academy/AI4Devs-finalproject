using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Accomplices;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Aura.Core.Services;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Aura.Core.Tests.Services;

public class AccompliceServiceTests
{
    private readonly IAccompliceRepository _accompliceRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IMagicLinkService _magicLinkService;
    private readonly IQueueService _queueService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AccompliceService> _logger;
    private readonly AccompliceService _sut;

    public AccompliceServiceTests()
    {
        _accompliceRepository = Substitute.For<IAccompliceRepository>();
        _eventRepository = Substitute.For<IEventRepository>();
        _magicLinkService = Substitute.For<IMagicLinkService>();
        _queueService = Substitute.For<IQueueService>();
        _configuration = Substitute.For<IConfiguration>();
        _logger = Substitute.For<ILogger<AccompliceService>>();

        _sut = new AccompliceService(
            _accompliceRepository,
            _eventRepository,
            _magicLinkService,
            _queueService,
            _configuration,
            _logger
        );
    }

    [Fact]
    public async Task GrantAccessAsync_ValidRequest_CreatesAccompliceAndSendsEmail()
    {
        // Arrange
        var eventSlug = "test-event";
        var ev = new Event { Id = Guid.NewGuid(), Slug = eventSlug, EventDate = DateTimeOffset.UtcNow.AddDays(10) };
        var request = new GrantAccessRequest { Email = "test@example.com", Permissions = new List<string> { "send_messages" } };
        var token = "random-token";
        var hashedToken = "hashed-token";

        _eventRepository.GetBySlugAsync(eventSlug).Returns(ev);
        _magicLinkService.GenerateToken().Returns(token);
        _magicLinkService.HashToken(token).Returns(hashedToken);

        // Act
        var result = await _sut.GrantAccessAsync(eventSlug, request);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be(request.Email);
        await _accompliceRepository.Received(1).AddAsync(Arg.Is<Accomplice>(a => a.Email == request.Email && a.TokenHash == hashedToken), Arg.Any<CancellationToken>());
        await _queueService.Received(1).EnqueueAsync("email:queue", Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifyTokenAsync_ValidToken_ReturnsJwt()
    {
        // Arrange
        var token = "valid-token";
        var hashedToken = "valid-hashed";
        var accompliceId = Guid.NewGuid();
        var accomplice = new Accomplice
        {
            Id = accompliceId,
            Email = "test@example.com",
            TokenHash = hashedToken,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(1),
            IsRevoked = false,
            EventId = Guid.NewGuid(),
            Permissions = "[\"send_messages\"]"
        };

        _magicLinkService.HashToken(token).Returns(hashedToken);
        _accompliceRepository.GetByTokenAsync(hashedToken, Arg.Any<CancellationToken>()).Returns(accomplice);
        _configuration["Jwt:Key"].Returns("super_secret_key_that_is_at_least_32_bytes_long_which_we_need_for_hs256");

        // Act
        var result = await _sut.VerifyTokenAsync(token);

        // Assert
        result.Should().NotBeNullOrEmpty();
        await _accompliceRepository.Received(1).UpdateAsync(Arg.Is<Accomplice>(a => a.LastAccessedAt != null), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task VerifyTokenAsync_ExpiredToken_ThrowsUnauthorized()
    {
        // Arrange
        var token = "expired-token";
        var hashedToken = "expired-hashed";
        var accomplice = new Accomplice
        {
            TokenHash = hashedToken,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(-1), // Expired
            IsRevoked = false
        };

        _magicLinkService.HashToken(token).Returns(hashedToken);
        _accompliceRepository.GetByTokenAsync(hashedToken, Arg.Any<CancellationToken>()).Returns(accomplice);

        // Act
        Func<Task> act = async () => await _sut.VerifyTokenAsync(token);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task RevokeAccessAsync_ValidId_SetsIsRevokedToTrue()
    {
        // Arrange
        var accompliceId = Guid.NewGuid();
        var accomplice = new Accomplice { Id = accompliceId, IsRevoked = false };
        _accompliceRepository.GetByIdAsync(accompliceId, Arg.Any<CancellationToken>()).Returns(accomplice);

        // Act
        await _sut.RevokeAccessAsync(accompliceId);

        // Assert
        accomplice.IsRevoked.Should().BeTrue();
        await _accompliceRepository.Received(1).UpdateAsync(accomplice, Arg.Any<CancellationToken>());
    }
}
