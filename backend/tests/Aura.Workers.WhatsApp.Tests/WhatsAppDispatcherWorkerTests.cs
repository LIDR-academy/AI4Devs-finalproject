using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.WhatsApp;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Aura.Workers.WhatsApp.Tests;

public class WhatsAppDispatcherWorkerTests
{
    private readonly IWhatsAppService _whatsappService;
    private readonly IDeliveryLogRepository _deliveryLogRepo;
    private readonly IQueueService _queueService;
    private readonly ILogger<WhatsAppDispatcherWorker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly IServiceScope _scope;
    private readonly IServiceScopeFactory _scopeFactory;

    public WhatsAppDispatcherWorkerTests()
    {
        _whatsappService = Substitute.For<IWhatsAppService>();
        _deliveryLogRepo = Substitute.For<IDeliveryLogRepository>();
        _queueService = Substitute.For<IQueueService>();
        _logger = Substitute.For<ILogger<WhatsAppDispatcherWorker>>();

        _serviceProvider = Substitute.For<IServiceProvider>();
        _serviceProvider.GetService(typeof(IWhatsAppService)).Returns(_whatsappService);
        _serviceProvider.GetService(typeof(IDeliveryLogRepository)).Returns(_deliveryLogRepo);
        _serviceProvider.GetService(typeof(IQueueService)).Returns(_queueService);

        _scope = Substitute.For<IServiceScope>();
        _scope.ServiceProvider.Returns(_serviceProvider);

        _scopeFactory = Substitute.For<IServiceScopeFactory>();
        _scopeFactory.CreateScope().Returns(_scope);

        var rootProvider = Substitute.For<IServiceProvider>();
        rootProvider.GetService(typeof(IServiceScopeFactory)).Returns(_scopeFactory);
    }

    [Fact]
    public async Task ProcessMessageAsync_Success_UpdatesLog()
    {
        // Arrange
        var worker = new WhatsAppDispatcherWorker(_serviceProvider, _logger);
        var payload = new WhatsAppMessagePayload
        {
            To = "123",
            TemplateName = "hello",
            DeliveryLogId = Guid.NewGuid()
        };
        var message = JsonSerializer.Serialize(payload);

        var log = new DeliveryLog { Id = payload.DeliveryLogId.Value };
        _deliveryLogRepo.GetByIdAsync(log.Id, Arg.Any<CancellationToken>()).Returns(log);

        _whatsappService.SendTemplateMessageAsync("123", "hello", Arg.Any<System.Collections.Generic.IDictionary<string, string>>(), Arg.Any<CancellationToken>())
            .Returns("wamid.123");

        // Act
        await worker.ProcessMessageAsync(message, _scope, CancellationToken.None);

        // Assert
        Assert.Equal(DeliveryStatus.Sent, log.DeliveryStatus);
        Assert.Equal("wamid.123", log.ProviderMessageId);
        await _deliveryLogRepo.Received(1).UpdateAsync(log, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProcessMessageAsync_Failure_FirstAttempt_SchedulesRetry()
    {
        // Arrange
        var worker = new WhatsAppDispatcherWorker(_serviceProvider, _logger);
        var payload = new WhatsAppMessagePayload { To = "123", TemplateName = "hello", Attempt = 1, DeliveryLogId = Guid.NewGuid() };
        var message = JsonSerializer.Serialize(payload);

        var log = new DeliveryLog { Id = payload.DeliveryLogId.Value };
        _deliveryLogRepo.GetByIdAsync(log.Id, Arg.Any<CancellationToken>()).Returns(log);

        _whatsappService.SendTemplateMessageAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<System.Collections.Generic.Dictionary<string, string>>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException<string>(new Exception("API Error")));

        // Act
        await worker.ProcessMessageAsync(message, _scope, CancellationToken.None);

        // Assert
        Assert.Equal(1, log.RetryCount);
        await _queueService.Received(1).ScheduleMessageAsync("whatsapp:retry", Arg.Is<string>(s => s.Contains("\"Attempt\":2")), Arg.Any<DateTimeOffset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProcessMessageAsync_Failure_ThirdAttempt_FallsBackToEmail()
    {
        // Arrange
        var worker = new WhatsAppDispatcherWorker(_serviceProvider, _logger);
        var payload = new WhatsAppMessagePayload { To = "123", TemplateName = "hello", Attempt = 3, DeliveryLogId = Guid.NewGuid() };
        var message = JsonSerializer.Serialize(payload);

        var log = new DeliveryLog { Id = payload.DeliveryLogId.Value };
        _deliveryLogRepo.GetByIdAsync(log.Id, Arg.Any<CancellationToken>()).Returns(log);

        _whatsappService.SendTemplateMessageAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<System.Collections.Generic.Dictionary<string, string>>(), Arg.Any<CancellationToken>())
            .Returns(Task.FromException<string>(new Exception("API Error")));

        // Act
        await worker.ProcessMessageAsync(message, _scope, CancellationToken.None);

        // Assert
        Assert.Equal(DeliveryStatus.Failed, log.DeliveryStatus);
        await _queueService.Received(1).EnqueueAsync("email:queue", Arg.Is<string>(s => s.Contains("\"Type\":\"invitation-fallback\"")), Arg.Any<CancellationToken>());
        await _queueService.DidNotReceiveWithAnyArgs().ScheduleMessageAsync(default!, default!, default, default);
    }
}
