using System.Net;
using Aura.Api.Middleware;
using AwesomeAssertions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;

namespace Aura.Api.Tests;

public class CsrfValidationMiddlewareTests
{
    private static HttpClient CreateClient()
    {
        var host = new HostBuilder()
            .ConfigureWebHost(builder =>
            {
                builder.UseTestServer();
                builder.Configure(app =>
                {
                    app.UseMiddleware<CsrfValidationMiddleware>();
                    app.Run(async context =>
                    {
                        await context.Response.WriteAsync("OK");
                    });
                });
            })
            .Build();

        host.Start();
        return host.GetTestClient();
    }

    [Fact]
    public async Task GetRequest_WithoutCsrfToken_Succeeds()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task PostRequest_WithoutCsrfToken_Returns403()
    {
        var client = CreateClient();

        var response = await client.PostAsync("/", null);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("CSRF validation failed");
        body.Should().Contain("CSRF_INVALID");
    }

    [Fact]
    public async Task PostRequest_WithMismatchedCsrfToken_Returns403()
    {
        var client = CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "/");
        request.Headers.Add("X-CSRF-Token", "wrong-token");
        request.Headers.Add("Cookie", "aura_csrf=correct-token");

        var response = await client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task PostRequest_WithMatchingCsrfToken_Succeeds()
    {
        var client = CreateClient();
        var token = "valid-csrf-token-12345";
        var request = new HttpRequestMessage(HttpMethod.Post, "/");
        request.Headers.Add("X-CSRF-Token", token);
        request.Headers.Add("Cookie", $"aura_csrf={token}");

        var response = await client.SendAsync(request);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task HeadRequest_WithoutCsrfToken_Succeeds()
    {
        var client = CreateClient();

        var response = await client.SendAsync(new HttpRequestMessage(HttpMethod.Head, "/"));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task OptionsRequest_WithoutCsrfToken_Succeeds()
    {
        var client = CreateClient();

        var response = await client.SendAsync(new HttpRequestMessage(HttpMethod.Options, "/"));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
