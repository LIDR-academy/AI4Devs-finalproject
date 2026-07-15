using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Email;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Aura.Workers.Email;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Aura.Workers.Email.Tests;

public class EmailDispatcherWorkerTests
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IServiceScope _serviceScope;
    private readonly ILogger<EmailDispatcherWorker> _logger;
    private readonly IEmailService _emailService;
    private readonly IDeliveryLogRepository _deliveryLogRepo;
    private readonly EmailTemplateRenderer _templateRenderer;
    private readonly EmailDispatcherWorker _worker;

    public EmailDispatcherWorkerTests()
    {
        _emailService = Substitute.For<IEmailService>();
        _deliveryLogRepo = Substitute.For<IDeliveryLogRepository>();
        _logger = Substitute.For<ILogger<EmailDispatcherWorker>>();
        
        // Create a temporary template for testing
        var tempDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempDir);
        File.WriteAllText(Path.Combine(tempDir, "test-template.html"), "Hello {{name}}");
        
        _templateRenderer = new EmailTemplateRenderer(tempDir);

        _serviceProvider = Substitute.For<IServiceProvider>();
        _serviceScope = Substitute.For<IServiceScope>();
        
        var scopeFactory = Substitute.For<IServiceScopeFactory>();
        _serviceProvider.GetService(typeof(IServiceScopeFactory)).Returns(scopeFactory);
        scopeFactory.CreateScope().Returns(_serviceScope);
        
        _serviceScope.ServiceProvider.GetService(typeof(IEmailService)).Returns(_emailService);
        _serviceScope.ServiceProvider.GetService(typeof(IDeliveryLogRepository)).Returns(_deliveryLogRepo);
        _serviceScope.ServiceProvider.GetService(typeof(EmailTemplateRenderer)).Returns(_templateRenderer);

        _worker = new EmailDispatcherWorker(_serviceProvider, _logger);
    }

    [Fact]
    public async Task ProcessMessageAsync_ShouldRenderTemplateAndSendEmail_AndUpdateLog()
    {
        // Arrange
        var logId = Guid.NewGuid();
        var payload = new EmailMessagePayload
        {
            To = "test@example.com",
            Subject = "Test Subject",
            TemplateName = "test-template",
            Tokens = new Dictionary<string, string> { { "name", "Pedro" } },
            DeliveryLogId = logId
        };
        var message = JsonSerializer.Serialize(payload);
        var log = new DeliveryLog { Id = logId, DeliveryStatus = DeliveryStatus.Pending };

        _deliveryLogRepo.GetByIdAsync(logId, Arg.Any<CancellationToken>()).Returns(log);

        // Act
        await _worker.ProcessMessageAsync(message, _serviceScope, CancellationToken.None);

        // Assert
        await _emailService.Received(1).SendEmailAsync("test@example.com", "Test Subject", "Hello Pedro");
        await _deliveryLogRepo.Received(1).UpdateAsync(Arg.Is<DeliveryLog>(l => l.DeliveryStatus == DeliveryStatus.Delivered), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ProcessMessageAsync_ShouldUpdateLogToFailed_WhenEmailFails()
    {
        // Arrange
        var logId = Guid.NewGuid();
        var payload = new EmailMessagePayload
        {
            To = "test@example.com",
            Subject = "Test Subject",
            TemplateName = "test-template",
            Tokens = new Dictionary<string, string> { { "name", "Pedro" } },
            DeliveryLogId = logId
        };
        var message = JsonSerializer.Serialize(payload);
        var log = new DeliveryLog { Id = logId, DeliveryStatus = DeliveryStatus.Pending };

        _deliveryLogRepo.GetByIdAsync(logId, Arg.Any<CancellationToken>()).Returns(log);
        _emailService.When(x => x.SendEmailAsync(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>()))
            .Throw(new Exception("SMTP Error"));

        // Act
        await _worker.ProcessMessageAsync(message, _serviceScope, CancellationToken.None);

        // Assert
        await _deliveryLogRepo.Received(1).UpdateAsync(Arg.Is<DeliveryLog>(l => l.DeliveryStatus == DeliveryStatus.Failed && l.RetryCount == 1), Arg.Any<CancellationToken>());
    }
}
