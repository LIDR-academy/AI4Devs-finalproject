using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aura.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using NSubstitute;
using Xunit;

namespace Aura.Infrastructure.Tests.Services;

public class MetaWhatsAppServiceTests
{
    private readonly IConfiguration _mockConfiguration;

    public MetaWhatsAppServiceTests()
    {
        _mockConfiguration = Substitute.For<IConfiguration>();
        _mockConfiguration["WhatsApp:PhoneNumberId"].Returns("12345");
        _mockConfiguration["WhatsApp:AccessToken"].Returns("token");
    }

    [Fact]
    public async Task SendTemplateMessageAsync_FormatsRequestCorrectly()
    {
        // Arrange
        var handler = new MockHttpMessageHandler(new HttpResponseMessage
        {
            StatusCode = HttpStatusCode.OK,
            Content = new StringContent("{ \"messages\": [ { \"id\": \"wamid.test\" } ] }", Encoding.UTF8, "application/json")
        });

        var httpClient = new HttpClient(handler);
        var sut = new MetaWhatsAppService(httpClient, _mockConfiguration);

        var vars = new Dictionary<string, string> { { "1", "John" } };

        // Act
        var result = await sut.SendTemplateMessageAsync("555123456", "hello_world", vars);

        // Assert
        Assert.Equal("wamid.test", result);
        Assert.Single(handler.Requests);

        var request = handler.Requests[0];
        Assert.Equal(HttpMethod.Post, request.Method);
        Assert.Equal("Bearer", request.Headers.Authorization?.Scheme);
        Assert.Equal("token", request.Headers.Authorization?.Parameter);
        Assert.Equal("https://graph.facebook.com/v18.0/12345/messages", request.RequestUri?.ToString());

        var content = await request.Content!.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var root = doc.RootElement;

        Assert.Equal("whatsapp", root.GetProperty("messaging_product").GetString());
        Assert.Equal("555123456", root.GetProperty("to").GetString());
        Assert.Equal("template", root.GetProperty("type").GetString());
        Assert.Equal("hello_world", root.GetProperty("template").GetProperty("name").GetString());
        Assert.Equal("es", root.GetProperty("template").GetProperty("language").GetProperty("code").GetString());
    }
}

public class MockHttpMessageHandler : HttpMessageHandler
{
    private readonly HttpResponseMessage _response;
    public List<HttpRequestMessage> Requests { get; } = new List<HttpRequestMessage>();

    public MockHttpMessageHandler(HttpResponseMessage response)
    {
        _response = response;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Requests.Add(request);
        return Task.FromResult(_response);
    }
}
