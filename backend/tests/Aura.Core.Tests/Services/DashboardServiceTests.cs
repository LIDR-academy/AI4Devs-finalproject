using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Dashboard;
using Aura.Core.Enums;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Core.Services;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace Aura.Core.Tests.Services;

public class DashboardServiceTests
{
    private readonly IEventRepository _eventRepository;
    private readonly IDashboardRepository _dashboardRepository;
    private readonly DashboardService _sut;

    public DashboardServiceTests()
    {
        _eventRepository = Substitute.For<IEventRepository>();
        _dashboardRepository = Substitute.For<IDashboardRepository>();
        _sut = new DashboardService(_eventRepository, _dashboardRepository);
    }

    [Fact]
    public async Task GetDashboardStatsAsync_ShouldThrowNotFoundException_WhenEventDoesNotExist()
    {
        // Arrange
        var slug = "non-existent";
        var userId = Guid.NewGuid();
        _eventRepository.GetBySlugAsync(slug).Returns((Event?)null);

        // Act
        Func<Task> act = async () => await _sut.GetDashboardStatsAsync(slug, userId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetDashboardStatsAsync_ShouldThrowNotFoundException_WhenUserIsNotOwner()
    {
        // Arrange
        var slug = "my-event";
        var userId = Guid.NewGuid();
        var evt = new Event { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), Slug = slug, Name = "Test" };
        _eventRepository.GetBySlugAsync(slug).Returns(evt);

        // Act
        Func<Task> act = async () => await _sut.GetDashboardStatsAsync(slug, userId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetDashboardStatsAsync_ShouldReturnStats_WhenAuthorized()
    {
        // Arrange
        var slug = "my-event";
        var userId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var evt = new Event { Id = eventId, UserId = userId, Slug = slug, Name = "Test" };
        
        var expectedStats = new DashboardStatsResponse
        {
            TotalInvited = 10,
            Confirmed = 5,
            Declined = 2,
            Pending = 3,
            Maybe = 0,
            TransportNeedsCount = 1,
            PlusOneCount = 0
        };

        _eventRepository.GetBySlugAsync(slug).Returns(evt);
        _dashboardRepository.GetStatsAsync(eventId, Arg.Any<CancellationToken>()).Returns(expectedStats);

        // Act
        var result = await _sut.GetDashboardStatsAsync(slug, userId);

        // Assert
        result.Should().BeEquivalentTo(expectedStats);
    }

    [Fact]
    public async Task ExportGuestListCsvAsync_ShouldReturnCsvBytes_WhenAuthorized()
    {
        // Arrange
        var slug = "my-event";
        var userId = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var evt = new Event { Id = eventId, UserId = userId, Slug = slug, Name = "Test" };
        
        var exportData = new List<GuestExportDto>
        {
            new() { Name = "John Doe", Email = "john@example.com", Category = "Friend", RsvpStatus = "Yes", TransportNeeds = false },
            new() { Name = "Jane Smith", Email = "jane@example.com", Category = "Family", RsvpStatus = "No", TransportNeeds = true }
        };

        _eventRepository.GetBySlugAsync(slug).Returns(evt);
        _dashboardRepository.GetGuestExportDataAsync(eventId, Arg.Any<CancellationToken>()).Returns(exportData);

        // Act
        var result = await _sut.ExportGuestListCsvAsync(slug, userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().NotBeEmpty();

        var csvString = Encoding.UTF8.GetString(result);
        csvString.Should().Contain("Name");
        csvString.Should().Contain("John Doe");
        csvString.Should().Contain("jane@example.com");
    }
}
