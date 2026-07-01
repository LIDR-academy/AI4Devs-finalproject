using System.Net;
using Aura.Api.Middleware;
using AwesomeAssertions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;

namespace Aura.Api.Tests;

public class SecurityHeadersMiddlewareTests
{
    private static HttpClient CreateClient()
    {
        var host = new HostBuilder()
            .ConfigureWebHost(builder =>
            {
                builder.UseTestServer();
                builder.Configure(app =>
                {
                    app.UseMiddleware<SecurityHeadersMiddleware>();
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
    public async Task Response_ContainsAllSecurityHeaders()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Headers.Should().ContainKey("X-Content-Type-Options");
        response.Headers.GetValues("X-Content-Type-Options").Should().Contain("nosniff");

        response.Headers.Should().ContainKey("X-Frame-Options");
        response.Headers.GetValues("X-Frame-Options").Should().Contain("DENY");

        response.Headers.Should().ContainKey("Referrer-Policy");
        response.Headers.GetValues("Referrer-Policy").Should().Contain("strict-origin-when-cross-origin");

        response.Headers.Should().ContainKey("Strict-Transport-Security");
        response.Headers.GetValues("Strict-Transport-Security").Should().Contain("max-age=31536000; includeSubDomains");

        response.Headers.Should().ContainKey("Content-Security-Policy");
    }
}
