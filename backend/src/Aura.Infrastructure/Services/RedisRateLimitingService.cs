using Aura.Core.Interfaces.Services;
using StackExchange.Redis;

namespace Aura.Infrastructure.Services;

public class RedisRateLimitingService : IRateLimitingService
{
    private readonly IConnectionMultiplexer _redis;

    public RedisRateLimitingService(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<bool> IsRateLimitedAsync(string key, int limit, TimeSpan window, CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var currentCount = await db.StringIncrementAsync(key);

        if (currentCount == 1)
        {
            await db.KeyExpireAsync(key, window);
        }

        return currentCount > limit;
    }
}
