using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Aura.Api.Controllers;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Aura.Api.Tests.Controllers;

public class WebhooksControllerTests
{
    private readonly IConfiguration _config;
    private readonly IDeliveryLogRepository _logRepo;
    private readonly IInvitationRepository _invRepo;
    private readonly ILogger<WebhooksController> _logger;
    private readonly ILiveMessageRepository _liveMessageRepo;
    private readonly WebhooksController _sut;

    public WebhooksControllerTests()
    {
        _config = Substitute.For<IConfiguration>();
        _config["WhatsApp:VerifyToken"].Returns("my_secret");

        _logRepo = Substitute.For<IDeliveryLogRepository>();
        _invRepo = Substitute.For<IInvitationRepository>();
        _logger = Substitute.For<ILogger<WebhooksController>>();
        _liveMessageRepo = Substitute.For<ILiveMessageRepository>();

        _sut = new WebhooksController(_config, _logRepo, _invRepo, _liveMessageRepo, _logger);
        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext()
        };
    }

    [Fact]
    public void VerifyWhatsAppWebhook_ValidToken_ReturnsChallenge()
    {
        var result = _sut.VerifyWhatsAppWebhook("subscribe", "my_secret", "1234");
        
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("1234", okResult.Value);
    }

    [Fact]
    public void VerifyWhatsAppWebhook_InvalidToken_ReturnsForbid()
    {
        var result = _sut.VerifyWhatsAppWebhook("subscribe", "wrong", "1234");
        
        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task ReceiveWhatsAppWebhook_ValidPayload_UpdatesDeliveryLogAndInvitation()
    {
        var json = @"
        {
            ""entry"": [
                {
                    ""changes"": [
                        {
                            ""value"": {
                                ""statuses"": [
                                    {
                                        ""id"": ""wamid.test"",
                                        ""status"": ""delivered"",
                                        ""timestamp"": ""1600000000""
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }";

        _sut.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(json));

        var log = new DeliveryLog { Id = Guid.NewGuid(), ProviderMessageId = "wamid.test", DeliveryStatus = DeliveryStatus.Sent, EntityType = DeliveryEntityType.Invitation, EntityId = Guid.NewGuid() };
        var inv = new Invitation { Id = log.EntityId, DeliveryStatus = DeliveryStatus.Sent };

        _logRepo.GetByProviderMessageIdAsync("wamid.test").Returns(log);
        _invRepo.GetByIdAsync(log.EntityId).Returns(inv);

        var result = await _sut.ReceiveWhatsAppWebhook();

        Assert.IsType<OkResult>(result);
        Assert.Equal(DeliveryStatus.Delivered, log.DeliveryStatus);
        Assert.Equal(DateTimeOffset.FromUnixTimeSeconds(1600000000), log.DeliveredAt);
        Assert.Equal(DeliveryStatus.Delivered, inv.DeliveryStatus);

        await _logRepo.Received(1).UpdateAsync(log);
        await _invRepo.Received(1).UpdateAsync(inv);
    }
}
