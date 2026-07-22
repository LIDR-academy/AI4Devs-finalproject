using Aura.Core.Models;
using RazorLight;

namespace Aura.Workers.SSG.Services;

public class TemplateRenderer
{
    private readonly IRazorLightEngine _engine;

    public TemplateRenderer()
    {
        _engine = new RazorLightEngineBuilder()
            .UseFileSystemProject(Path.Combine(AppContext.BaseDirectory, "templates"))
            .UseMemoryCachingProvider()
            .Build();
    }

    public async Task<string> RenderHtmlAsync(Event @event)
    {
        var templateName = @event.Template?.Name?.ToLowerInvariant() switch
        {
            "modern minimal" => "modern",
            "rustic charm" => "rustic",
            _ => "classic"
        };

        return await _engine.CompileRenderAsync($"{templateName}/index.cshtml", @event);
    }

    public async Task<string> RenderCssAsync(Event @event)
    {
        return await _engine.CompileRenderAsync("shared/styles.cshtml", @event);
    }
}
