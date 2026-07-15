using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace Aura.Workers.Email;

public class EmailTemplateRenderer
{
    private readonly string _templatesBasePath;

    public EmailTemplateRenderer(string templatesBasePath = "templates")
    {
        _templatesBasePath = templatesBasePath;
    }

    public async Task<string> RenderAsync(string templateName, Dictionary<string, string> tokens)
    {
        var templatePath = Path.Combine(_templatesBasePath, $"{templateName}.html");
        
        if (!File.Exists(templatePath))
        {
            throw new FileNotFoundException($"Email template not found: {templatePath}");
        }

        var templateContent = await File.ReadAllTextAsync(templatePath);

        foreach (var token in tokens)
        {
            templateContent = templateContent.Replace($"{{{{{token.Key}}}}}", token.Value);
        }

        return templateContent;
    }
}
