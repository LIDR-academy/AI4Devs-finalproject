using Aura.Api.Controllers;
using Aura.Core.Enums;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using System.Text;
using Xunit;

namespace Aura.Api.Tests.Controllers;

public class PaymentsControllerTests
{
    private readonly IPaymentService _paymentService;
    private readonly IEventRepository _eventRepository;
    private readonly PaymentsController _sut;

    public PaymentsControllerTests()
    {
        _paymentService = Substitute.For<IPaymentService>();
        _eventRepository = Substitute.For<IEventRepository>();
        
        _sut = new PaymentsController(_paymentService, _eventRepository)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            }
        };
    }

    [Fact]
    public async Task PublishEvent_EventNotFound_ReturnsNotFound()
    {
        // Arrange
        _eventRepository.GetBySlugAsync("invalid-slug")
            .Returns(Task.FromResult<Event?>(null));

        // Act
        var result = await _sut.PublishEvent("invalid-slug", new PublishEventRequest { Tier = PaymentTier.Standard }, CancellationToken.None);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task PublishEvent_ValidRequest_ReturnsOkWithClientSecret()
    {
        // Arrange
        var ev = new Event { Id = Guid.NewGuid(), Slug = "valid-slug", Status = EventStatus.Draft };
        _eventRepository.GetBySlugAsync("valid-slug")
            .Returns(ev);
        
        _paymentService.CreatePaymentIntentAsync(ev.Id, PaymentTier.Standard, Arg.Any<CancellationToken>())
            .Returns("pi_secret_123");

        // Act
        var result = await _sut.PublishEvent("valid-slug", new PublishEventRequest { Tier = PaymentTier.Standard }, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    [Fact]
    public async Task StripeWebhook_InvalidSignature_ReturnsBadRequest()
    {
        // Arrange
        _sut.HttpContext.Request.Headers["Stripe-Signature"] = "invalid_sig";
        var bodyBytes = Encoding.UTF8.GetBytes("{}");
        _sut.HttpContext.Request.Body = new MemoryStream(bodyBytes);

        _paymentService.ProcessWebhookAsync(Arg.Any<string>(), "invalid_sig", Arg.Any<CancellationToken>())
            .Throws(new DomainValidationException("Invalid signature"));

        // Act
        var result = await _sut.StripeWebhook(CancellationToken.None);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(badRequestResult.Value);
    }

    [Fact]
    public async Task StripeWebhook_ValidWebhook_ReturnsOk()
    {
        // Arrange
        _sut.HttpContext.Request.Headers["Stripe-Signature"] = "valid_sig";
        var bodyBytes = Encoding.UTF8.GetBytes("{}");
        _sut.HttpContext.Request.Body = new MemoryStream(bodyBytes);

        // Act
        var result = await _sut.StripeWebhook(CancellationToken.None);

        // Assert
        Assert.IsType<OkResult>(result);
    }
}
