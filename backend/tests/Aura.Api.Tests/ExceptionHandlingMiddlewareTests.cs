using System.Net;
using System.Text.Json;
using Aura.Api.Middleware;
using Aura.Core.Exceptions;
using AwesomeAssertions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Aura.Api.Tests;

public class ExceptionHandlingMiddlewareTests
{
    private static HttpClient CreateClient(RequestDelegate throwAction, string environment = "Production")
    {
        var host = new HostBuilder()
            .ConfigureWebHost(builder =>
            {
                builder.UseTestServer();
                builder.UseEnvironment(environment);
                builder.Configure(app =>
                {
                    app.UseMiddleware<ExceptionHandlingMiddleware>();
                    app.Run(throwAction);
                });
                builder.ConfigureServices(services =>
                {
                    services.AddLogging();
                });
            })
            .Build();

        host.Start();
        return host.GetTestClient();
    }

    [Fact]
    public async Task NotFoundException_Returns404()
    {
        var client = CreateClient(_ => throw new NotFoundException("Event not found"));

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("Not found");
    }

    [Fact]
    public async Task ForbiddenAccessException_Returns403()
    {
        var client = CreateClient(_ => throw new ForbiddenAccessException());

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ConflictException_Returns409()
    {
        var client = CreateClient(_ => throw new ConflictException("Duplicate slug"));

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task RateLimitExceededException_Returns429WithRetryAfter()
    {
        var client = CreateClient(_ => throw new RateLimitExceededException(30));

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);
        response.Headers.RetryAfter.Should().NotBeNull();
        response.Headers.RetryAfter!.Delta.Should().Be(TimeSpan.FromSeconds(30));
    }

    [Fact]
    public async Task UnexpectedException_InProduction_Returns500WithoutDetails()
    {
        var client = CreateClient(_ => throw new InvalidOperationException("Secret internal info"));

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("An internal error has occurred");
        body.Should().NotContain("Secret internal info");
    }

    [Fact]
    public async Task UnexpectedException_InDevelopment_Returns500WithDetails()
    {
        var client = CreateClient(_ => throw new InvalidOperationException("Debug info"), "Development");

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain("Debug info");
    }

    [Fact]
    public async Task UnauthorizedAccessException_Returns401()
    {
        var client = CreateClient(_ => throw new UnauthorizedAccessException("Not allowed"));

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
