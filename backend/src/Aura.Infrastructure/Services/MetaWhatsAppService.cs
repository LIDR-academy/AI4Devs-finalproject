using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.Interfaces.Services;
using Microsoft.Extensions.Configuration;

namespace Aura.Infrastructure.Services;

public class MetaWhatsAppService : IWhatsAppService
{
    private readonly HttpClient _httpClient;
    private readonly string _phoneNumberId;
    private readonly string _accessToken;

    public MetaWhatsAppService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _phoneNumberId = configuration["WhatsApp:PhoneNumberId"] ?? throw new ArgumentNullException("WhatsApp:PhoneNumberId is missing");
        _accessToken = configuration["WhatsApp:AccessToken"] ?? throw new ArgumentNullException("WhatsApp:AccessToken is missing");
        
        _httpClient.BaseAddress = new Uri("https://graph.facebook.com/v18.0/");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
    }

    public async Task<string> SendTemplateMessageAsync(string to, string templateName, IDictionary<string, string> variables, CancellationToken cancellationToken = default)
    {
        var parameters = variables?.Select(kvp => new 
        {
            type = "text",
            text = kvp.Value
        }).ToList();

        var payload = new
        {
            messaging_product = "whatsapp",
            to = to,
            type = "template",
            template = new
            {
                name = templateName,
                language = new { code = "es" },
                components = parameters != null && parameters.Count > 0 ? new[]
                {
                    new
                    {
                        type = "body",
                        parameters = parameters
                    }
                } : Array.Empty<object>()
            }
        };

        return await SendMessageAsync(payload, cancellationToken);
    }

    public async Task<string> SendTextMessageAsync(string to, string message, CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            messaging_product = "whatsapp",
            to = to,
            type = "text",
            text = new { body = message }
        };

        return await SendMessageAsync(payload, cancellationToken);
    }

    public Task<string> GetDeliveryStatusAsync(string messageId, CancellationToken cancellationToken = default)
    {
        // Meta API uses webhooks to push delivery status updates.
        // There is no standard direct GET endpoint to poll message status by message ID for the Cloud API.
        // Returning a standard response indicating webhooks should be used.
        return Task.FromResult("Use Webhooks to receive status updates.");
    }

    private async Task<string> SendMessageAsync(object payload, CancellationToken cancellationToken)
    {
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_phoneNumberId}/messages", content, cancellationToken);

        response.EnsureSuccessStatusCode();

        var responseString = await response.Content.ReadAsStringAsync(cancellationToken);
        
        using var doc = JsonDocument.Parse(responseString);
        if (doc.RootElement.TryGetProperty("messages", out var messagesElement) && messagesElement.GetArrayLength() > 0)
        {
            return messagesElement[0].GetProperty("id").GetString() ?? string.Empty;
        }

        return string.Empty;
    }
}
