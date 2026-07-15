using Aura.Core.Configuration;
using Aura.Core.Enums;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Aura.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NSubstitute;
using Stripe;
using System.Text.Json;
using Xunit;

namespace Aura.Infrastructure.Tests.Services;

public class StripePaymentServiceTests
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IEventRepository _eventRepository;
    private readonly IQueueService _queueService;
    private readonly IOptions<StripeOptions> _options;
    private readonly ILogger<StripePaymentService> _logger;
    private readonly StripePaymentService _sut;

    public StripePaymentServiceTests()
    {
        _paymentRepository = Substitute.For<IPaymentRepository>();
        _eventRepository = Substitute.For<IEventRepository>();
        _queueService = Substitute.For<IQueueService>();
        
        var stripeOptions = new StripeOptions 
        { 
            SecretKey = "sk_test_123", 
            PublishableKey = "pk_test_123", 
            WebhookSecret = "whsec_123" 
        };
        _options = Microsoft.Extensions.Options.Options.Create(stripeOptions);
        _logger = Substitute.For<ILogger<StripePaymentService>>();

        _sut = new StripePaymentService(
            _paymentRepository,
            _eventRepository,
            _queueService,
            _options,
            _logger);
    }

    [Fact]
    public async Task CreatePaymentIntentAsync_EventNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        _eventRepository.GetByIdAsync(eventId, Arg.Any<CancellationToken>())
            .Returns(Task.FromResult<Core.Models.Event?>(null));

        // Act & Assert
        await Assert.ThrowsAsync<NotFoundException>(() => 
            _sut.CreatePaymentIntentAsync(eventId, PaymentTier.Standard));
    }

    [Fact]
    public async Task CreatePaymentIntentAsync_EventNotDraft_ThrowsBusinessRuleValidationException()
    {
        // Arrange
        var eventId = Guid.NewGuid();
        var ev = new Core.Models.Event { Id = eventId, Status = EventStatus.Published };
        _eventRepository.GetByIdAsync(eventId, Arg.Any<CancellationToken>())
            .Returns(ev);

        // Act & Assert
        await Assert.ThrowsAsync<DomainValidationException>(() => 
            _sut.CreatePaymentIntentAsync(eventId, PaymentTier.Standard));
    }

    // Since CreatePaymentIntentAsync calls Stripe APIs, it's hard to test fully without mocking Stripe, 
    // but we can test the exceptions. For signature validation, it also throws StripeException.
    
    [Fact]
    public async Task ProcessWebhookAsync_InvalidSignature_ThrowsBusinessRuleValidationException()
    {
        // Arrange
        var json = "{}";
        var signature = "invalid_sig";

        // Act & Assert
        await Assert.ThrowsAsync<DomainValidationException>(() => 
            _sut.ProcessWebhookAsync(json, signature));
    }
}
