using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Aura.Core.Services;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace Aura.Core.Tests.Services;

public class MessageTemplateServiceTests
{
    private readonly IMessageTemplateRepository _templateRepoMock;
    private readonly IEventRepository _eventRepoMock;
    private readonly MessageTemplateService _sut;

    public MessageTemplateServiceTests()
    {
        _templateRepoMock = Substitute.For<IMessageTemplateRepository>();
        _eventRepoMock = Substitute.For<IEventRepository>();

        _sut = new MessageTemplateService(_templateRepoMock, _eventRepoMock);
    }

    [Fact]
    public async Task CreateDefaultTemplatesAsync_NoTemplates_CreatesEightTemplates()
    {
        // Arrange
        var evId = Guid.NewGuid();
        _templateRepoMock.GetByEventIdAsync(evId, Arg.Any<CancellationToken>())
            .Returns(new List<MessageTemplate>());

        // Act
        await _sut.CreateDefaultTemplatesAsync(evId);

        // Assert
        await _templateRepoMock.Received(8).AddAsync(Arg.Any<MessageTemplate>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateDefaultTemplatesAsync_TemplatesExist_DoesNotCreate()
    {
        // Arrange
        var evId = Guid.NewGuid();
        _templateRepoMock.GetByEventIdAsync(evId, Arg.Any<CancellationToken>())
            .Returns(new List<MessageTemplate> { new MessageTemplate() });

        // Act
        await _sut.CreateDefaultTemplatesAsync(evId);

        // Assert
        await _templateRepoMock.DidNotReceive().AddAsync(Arg.Any<MessageTemplate>(), Arg.Any<CancellationToken>());
    }
}
