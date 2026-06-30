using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Aura.Api.Middleware;

public class CsrfValidationMiddleware(RequestDelegate next)
{
    private static readonly HashSet<string> SafeMethods = ["GET", "HEAD", "OPTIONS"];
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task InvokeAsync(HttpContext context)
    {
        if (!SafeMethods.Contains(context.Request.Method))
        {
            var cookieToken = context.Request.Cookies["aura_csrf"];
            var headerToken = context.Request.Headers["X-CSRF-Token"].ToString();

            if (string.IsNullOrEmpty(cookieToken) ||
                string.IsNullOrEmpty(headerToken) ||
                !FixedTimeEquals(cookieToken, headerToken))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";

                var response = new { error = "CSRF validation failed", code = "CSRF_INVALID" };
                await context.Response.WriteAsync(JsonSerializer.Serialize(response, JsonOptions));
                return;
            }
        }

        await next(context);
    }

    private static bool FixedTimeEquals(string a, string b)
    {
        var aBytes = Encoding.UTF8.GetBytes(a);
        var bBytes = Encoding.UTF8.GetBytes(b);

        if (aBytes.Length != bBytes.Length)
            return false;

        return CryptographicOperations.FixedTimeEquals(aBytes, bBytes);
    }
}
