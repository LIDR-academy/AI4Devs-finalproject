namespace Aura.Core.Interfaces.Services;

public interface IRateLimitingService
{
    Task<bool> IsRateLimitedAsync(string key, int limit, TimeSpan window, CancellationToken cancellationToken = default);
}
