using System.Net;
using System.Text.Json;
using StackExchange.Redis;

namespace Aura.Api.Middleware;

public class RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger, IConnectionMultiplexer redis)
{
    private const int GlobalLimit = 100;
    private const int WindowSeconds = 60;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task InvokeAsync(HttpContext context)
    {
        var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var key = $"ratelimit:ip:{clientIp}";

        try
        {
            var db = redis.GetDatabase();
            var count = await db.StringIncrementAsync(key);

            if (count == 1)
            {
                await db.KeyExpireAsync(key, TimeSpan.FromSeconds(WindowSeconds));
            }

            if (count > GlobalLimit)
            {
                var ttl = await db.KeyTimeToLiveAsync(key);
                var retryAfter = (int)(ttl?.TotalSeconds ?? WindowSeconds);

                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.ContentType = "application/json";
                context.Response.Headers.RetryAfter = retryAfter.ToString();

                var response = new { error = "Rate limit exceeded", message = "Too many requests. Please try again later." };
                await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
                return;
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Dragonfly unavailable for rate limiting, failing open");
        }

        await next(context);
    }
}
