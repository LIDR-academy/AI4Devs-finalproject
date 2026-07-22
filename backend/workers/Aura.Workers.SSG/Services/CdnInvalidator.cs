using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Aura.Workers.SSG.Services;

public class CdnInvalidator
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CdnInvalidator> _logger;
    private readonly string _zoneId;
    private readonly string _apiToken;
    private readonly string _siteDomain;

    public CdnInvalidator(HttpClient httpClient, IConfiguration configuration, ILogger<CdnInvalidator> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _zoneId = configuration["Cloudflare:ZoneId"] ?? "";
        _apiToken = configuration["Cloudflare:ApiToken"] ?? "";
        _siteDomain = configuration["Cloudflare:SiteDomain"] ?? "https://aura.planning";
    }

    public async Task PurgeCacheAsync(string eventSlug, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_zoneId) || string.IsNullOrEmpty(_apiToken))
        {
            _logger.LogWarning("Cloudflare credentials not configured. Skipping CDN purge.");
            return;
        }

        try
        {
            var requestUri = $"https://api.cloudflare.com/client/v4/zones/{_zoneId}/purge_cache";
            var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiToken);

            var payload = new
            {
                files = new[] { $"{_siteDomain}/e/{eventSlug}/" }
            };

            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request, cancellationToken);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Successfully purged CDN cache for slug {Slug}", eventSlug);
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Failed to purge CDN cache. Status: {StatusCode}, Error: {Error}", response.StatusCode, errorContent);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while purging CDN cache for {Slug}", eventSlug);
        }
    }
}
