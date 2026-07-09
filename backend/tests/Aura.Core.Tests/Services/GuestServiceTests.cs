using Aura.Core.DTOs.Guests;
using Aura.Core.Exceptions;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Core.Services;
using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using NSubstitute;
using Xunit;

namespace Aura.Core.Tests.Services;

public class GuestServiceTests
{
    private readonly IGuestRepository _guestRepo;
    private readonly IEventRepository _eventRepo;
    private readonly IValidator<AddGuestRequest> _addValidator;
    private readonly IValidator<ImportGuestRow> _importValidator;
    private readonly GuestService _sut;

    public GuestServiceTests()
    {
        _guestRepo = Substitute.For<IGuestRepository>();
        _eventRepo = Substitute.For<IEventRepository>();
        _addValidator = Substitute.For<IValidator<AddGuestRequest>>();
        _importValidator = Substitute.For<IValidator<ImportGuestRow>>();

        var validationResult = new ValidationResult();
        _addValidator.ValidateAsync(Arg.Any<IValidationContext>(), Arg.Any<CancellationToken>()).Returns(validationResult);

        _sut = new GuestService(_guestRepo, _eventRepo, _addValidator, _importValidator);
    }

    [Fact]
    public async Task AddGuestAsync_ThrowsDomainValidationException_WhenDraftLimitExceeded()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var evt = new Event { Id = Guid.NewGuid(), UserId = userId, Status = EventStatus.Draft };
        _eventRepo.GetBySlugAsync("test-slug").Returns(evt);
        _guestRepo.GetGuestCountAsync(evt.Id).Returns(5);

        var request = new AddGuestRequest("Test", null, null, null);

        // Act
        var act = () => _sut.AddGuestAsync(userId, "test-slug", request);

        // Assert
        await act.Should().ThrowAsync<DomainValidationException>()
            .WithMessage("*Guest limit exceeded for draft event*");
    }

    [Fact]
    public async Task AddGuestAsync_ThrowsDomainValidationException_WhenEmailDuplicate()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var evt = new Event { Id = Guid.NewGuid(), UserId = userId, Status = EventStatus.Published };
        _eventRepo.GetBySlugAsync("test-slug").Returns(evt);
        
        _guestRepo.ExistsByEmailAsync(evt.Id, "test@example.com").Returns(true);

        var request = new AddGuestRequest("Test", "test@example.com", null, null);

        // Act
        var act = () => _sut.AddGuestAsync(userId, "test-slug", request);

        // Assert
        await act.Should().ThrowAsync<DomainValidationException>()
            .WithMessage("*A guest with this email already exists*");
    }
}
