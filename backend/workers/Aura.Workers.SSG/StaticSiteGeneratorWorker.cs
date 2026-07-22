using System.Text.Json;
using Aura.Core.Models;
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace Aura.Workers.SSG;

public class SsgQueuePayload
{
    public string EventType { get; set; } = string.Empty;
    public Guid EventId { get; set; }
    public string EventSlug { get; set; } = string.Empty;
}

public class StaticSiteGeneratorWorker : BackgroundService
{
    private readonly ILogger<StaticSiteGeneratorWorker> _logger;
    private readonly IConnectionMultiplexer _redis;
    private readonly IServiceScopeFactory _scopeFactory;

    public StaticSiteGeneratorWorker(ILogger<StaticSiteGeneratorWorker> logger, IConnectionMultiplexer redis, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _redis = redis;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var db = _redis.GetDatabase();

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var result = await db.ListRightPopLeftPushAsync("ssg:queue", "ssg:queue:processing");

                if (!result.HasValue)
                {
                    await Task.Delay(1000, stoppingToken);
                    continue;
                }

                var payloadJson = result.ToString();
                var payload = JsonSerializer.Deserialize<SsgQueuePayload>(payloadJson, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                if (payload != null)
                {
                    await ProcessSsgPayloadAsync(payload, stoppingToken);
                }

                await db.ListRemoveAsync("ssg:queue:processing", result);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing ssg queue");
                await Task.Delay(5000, stoppingToken);
            }
        }
    }

    private async Task ProcessSsgPayloadAsync(SsgQueuePayload payload, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing SSG for event {EventSlug} ({EventType})", payload.EventSlug, payload.EventType);

        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        var @event = await context.Events
            .Include(e => e.Template)
            .FirstOrDefaultAsync(e => e.Id == payload.EventId, cancellationToken);

        if (@event == null)
        {
            _logger.LogWarning("Event {EventId} not found. Skipping SSG.", payload.EventId);
            return;
        }

        // Generate HTML and CSS
        var templateRenderer = scope.ServiceProvider.GetRequiredService<Services.TemplateRenderer>();
        var htmlContent = await templateRenderer.RenderHtmlAsync(@event);
        var cssContent = await templateRenderer.RenderCssAsync(@event);

        // Upload to MinIO
        var uploader = scope.ServiceProvider.GetRequiredService<Services.MinioUploader>();
        
        using var htmlStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(htmlContent));
        await uploader.UploadFileAsync($"{payload.EventSlug}/index.html", htmlStream, "text/html", cancellationToken);

        using var cssStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(cssContent));
        await uploader.UploadFileAsync($"{payload.EventSlug}/styles.css", cssStream, "text/css", cancellationToken);

        // Upload shared app.js
        var appJsPath = Path.Combine(AppContext.BaseDirectory, "templates", "shared", "app.js");
        if (File.Exists(appJsPath))
        {
            using var jsStream = File.OpenRead(appJsPath);
            await uploader.UploadFileAsync($"{payload.EventSlug}/app.js", jsStream, "application/javascript", cancellationToken);
        }
        
        // If updated, trigger purge cache
        if (payload.EventType == "updated")
        {
            var cdn = scope.ServiceProvider.GetRequiredService<Services.CdnInvalidator>();
            await cdn.PurgeCacheAsync(payload.EventSlug, cancellationToken);
        }
    }
}
