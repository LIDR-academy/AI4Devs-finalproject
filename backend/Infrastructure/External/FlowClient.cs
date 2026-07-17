using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;

namespace InkLink.Api.Infrastructure.External;

public class FlowSettings
{
    public const string SectionName = "Flow";

    /// <summary>When true (default until sandbox credentials exist) the MockFlowClient is used.</summary>
    public bool UseMock { get; set; } = true;
    public string ApiKey { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public string BaseUrl { get; set; } = "https://sandbox.flow.cl/api";
    /// <summary>Public URL of this API, used to build Flow callback/return URLs.</summary>
    public string ApiBaseUrl { get; set; } = "http://localhost:5000";
    public string FrontendBaseUrl { get; set; } = "http://localhost:4200";
}

/// <summary>Flow payment statuses (https://www.flow.cl/docs/api.html): 1=pending, 2=paid, 3=rejected, 4=cancelled.</summary>
public enum FlowPaymentStatus
{
    Pending = 1,
    Paid = 2,
    Rejected = 3,
    Cancelled = 4
}

public record FlowPaymentOrder(string Token, string PaymentUrl);

public interface IFlowClient
{
    Task<FlowPaymentOrder> CreatePaymentOrderAsync(
        string commerceOrder, string subject, int amount, string payerEmail,
        string returnUrl, string confirmationUrl, CancellationToken cancellationToken = default);

    Task<FlowPaymentStatus> GetPaymentStatusAsync(string token, CancellationToken cancellationToken = default);
}

/// <summary>
/// Real Flow Chile client. All requests are signed with HMAC-SHA256 over the
/// alphabetically-sorted parameters, as required by the Flow API.
/// Activated when Flow:UseMock=false and sandbox/production credentials are configured.
/// </summary>
public class FlowClient : IFlowClient
{
    private readonly HttpClient _httpClient;
    private readonly FlowSettings _settings;

    public FlowClient(HttpClient httpClient, FlowSettings settings)
    {
        _httpClient = httpClient;
        _settings = settings;
    }

    public async Task<FlowPaymentOrder> CreatePaymentOrderAsync(
        string commerceOrder, string subject, int amount, string payerEmail,
        string returnUrl, string confirmationUrl, CancellationToken cancellationToken = default)
    {
        var parameters = new SortedDictionary<string, string>
        {
            ["apiKey"] = _settings.ApiKey,
            ["commerceOrder"] = commerceOrder,
            ["subject"] = subject,
            ["currency"] = "CLP",
            ["amount"] = amount.ToString(),
            ["email"] = payerEmail,
            ["urlConfirmation"] = confirmationUrl,
            ["urlReturn"] = returnUrl
        };
        parameters["s"] = Sign(parameters, _settings.SecretKey);

        var response = await _httpClient.PostAsync(
            $"{_settings.BaseUrl}/payment/create",
            new FormUrlEncodedContent(parameters),
            cancellationToken);
        await EnsureFlowSuccessAsync(response, "payment/create", cancellationToken);

        var body = await response.Content.ReadFromJsonAsync<FlowCreateResponse>(cancellationToken)
            ?? throw new InvalidOperationException("Flow returned an empty payment/create response");
        return new FlowPaymentOrder(body.Token, $"{body.Url}?token={body.Token}");
    }

    public async Task<FlowPaymentStatus> GetPaymentStatusAsync(string token, CancellationToken cancellationToken = default)
    {
        var parameters = new SortedDictionary<string, string>
        {
            ["apiKey"] = _settings.ApiKey,
            ["token"] = token
        };
        var signature = Sign(parameters, _settings.SecretKey);
        var query = string.Join("&", parameters.Select(p => $"{p.Key}={Uri.EscapeDataString(p.Value)}"));

        var response = await _httpClient.GetAsync(
            $"{_settings.BaseUrl}/payment/getStatus?{query}&s={signature}", cancellationToken);
        await EnsureFlowSuccessAsync(response, "payment/getStatus", cancellationToken);

        var body = await response.Content.ReadFromJsonAsync<FlowStatusResponse>(cancellationToken)
            ?? throw new InvalidOperationException("Flow returned an empty payment/getStatus response");
        return (FlowPaymentStatus)body.Status;
    }

    /// <summary>Surfaces Flow's error body (e.g. invalid apiKey / signature) instead of a bare status code.</summary>
    private static async Task EnsureFlowSuccessAsync(
        HttpResponseMessage response, string operation, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }
        var error = await response.Content.ReadAsStringAsync(cancellationToken);
        throw new HttpRequestException(
            $"Flow {operation} failed ({(int)response.StatusCode}): {error}");
    }

    internal static string Sign(SortedDictionary<string, string> parameters, string secretKey)
    {
        var toSign = string.Concat(parameters.Select(p => p.Key + p.Value));
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(toSign));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private sealed record FlowCreateResponse(string Url, string Token, long FlowOrder);
    private sealed record FlowStatusResponse(int Status);
}

/// <summary>
/// Mock used while Flow sandbox credentials are not available (Flow:UseMock=true).
/// The payment URL points to the frontend simulated checkout (/pago-simulado), and the
/// outcome is set via PaymentsController's mock-outcome endpoint before the webhook fires.
/// </summary>
public class MockFlowClient : IFlowClient
{
    private static readonly ConcurrentDictionary<string, FlowPaymentStatus> Store = new();

    private readonly FlowSettings _settings;

    public MockFlowClient(FlowSettings settings)
    {
        _settings = settings;
    }

    public Task<FlowPaymentOrder> CreatePaymentOrderAsync(
        string commerceOrder, string subject, int amount, string payerEmail,
        string returnUrl, string confirmationUrl, CancellationToken cancellationToken = default)
    {
        var token = Guid.NewGuid().ToString("N");
        Store[token] = FlowPaymentStatus.Pending;
        var paymentUrl = $"{_settings.FrontendBaseUrl}/pago-simulado?token={token}&amount={amount}";
        return Task.FromResult(new FlowPaymentOrder(token, paymentUrl));
    }

    public Task<FlowPaymentStatus> GetPaymentStatusAsync(string token, CancellationToken cancellationToken = default) =>
        Task.FromResult(Store.TryGetValue(token, out var status) ? status : FlowPaymentStatus.Pending);

    public static void SetOutcome(string token, FlowPaymentStatus status) => Store[token] = status;
}
