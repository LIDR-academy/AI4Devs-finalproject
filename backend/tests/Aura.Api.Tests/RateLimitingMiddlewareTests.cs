using System.Net;
using Aura.Api.Middleware;
using AwesomeAssertions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using StackExchange.Redis;

namespace Aura.Api.Tests;

public class RateLimitingMiddlewareTests
{
    [Fact]
    public async Task Request_WithinLimit_Succeeds()
    {
        var mockDb = Substitute.For<IDatabase>();
        mockDb.StringIncrementAsync(Arg.Any<RedisKey>(), Arg.Any<long>(), Arg.Any<CommandFlags>())
            .Returns(1);
        mockDb.KeyExpireAsync(Arg.Any<RedisKey>(), Arg.Any<TimeSpan?>(), Arg.Any<CommandFlags>())
            .Returns(true);

        var mockMultiplexer = Substitute.For<IConnectionMultiplexer>();
        mockMultiplexer.GetDatabase(Arg.Any<int>(), Arg.Any<object>()).Returns(mockDb);

        var client = CreateClient(mockMultiplexer);

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Request_ExceedingLimit_Returns429()
    {
        var mockDb = Substitute.For<IDatabase>();
        mockDb.StringIncrementAsync(Arg.Any<RedisKey>(), Arg.Any<long>(), Arg.Any<CommandFlags>())
            .Returns(101);
        mockDb.KeyTimeToLiveAsync(Arg.Any<RedisKey>(), Arg.Any<CommandFlags>())
            .Returns(TimeSpan.FromSeconds(45));

        var mockMultiplexer = Substitute.For<IConnectionMultiplexer>();
        mockMultiplexer.GetDatabase(Arg.Any<int>(), Arg.Any<object>()).Returns(mockDb);

        var client = CreateClient(mockMultiplexer);

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);
        response.Headers.RetryAfter.Should().NotBeNull();
    }

    [Fact]
    public async Task DragonflyUnavailable_FailsOpen_AllowsRequest()
    {
        var mockMultiplexer = Substitute.For<IConnectionMultiplexer>();
        mockMultiplexer.GetDatabase(Arg.Any<int>(), Arg.Any<object>())
            .Throws(new RedisConnectionException(ConnectionFailureType.UnableToConnect, "Connection refused"));

        var client = CreateClient(mockMultiplexer);

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    private static HttpClient CreateClient(IConnectionMultiplexer multiplexer)
    {
        var host = new HostBuilder()
            .ConfigureWebHost(builder =>
            {
                builder.UseTestServer();
                builder.ConfigureServices(services =>
                {
                    services.AddSingleton(multiplexer);
                    services.AddLogging();
                });
                builder.Configure(app =>
                {
                    app.UseMiddleware<RateLimitingMiddleware>();
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
}
