using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ConsultCore31.WebAPI.Middleware
{
    public class ApiException
    {
        public ApiException(int statusCode, string? message = null, string? details = null)
        {
            StatusCode = statusCode;
            Message = message ?? "An error occurred while processing your request.";
            Details = details;
        }

        public string? Details { get; set; }
        public string? Message { get; set; }
        public int StatusCode { get; set; }

        // Método para serialización segura
        public string ToJson() => JsonSerializer.Serialize(this, ApiExceptionContext.Default.ApiException);
    }

    [JsonSerializable(typeof(ApiException))]
    [JsonSourceGenerationOptions(
        GenerationMode = JsonSourceGenerationMode.Metadata,
        PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = true)]
    public partial class ApiExceptionContext : JsonSerializerContext
    {
        public new static JsonSerializerOptions Options { get; } = new(JsonSerializerDefaults.Web)
        {
            TypeInfoResolver = new ApiExceptionContext()
        };
    }

    public class ExceptionMiddleware
    {
        private readonly IHostEnvironment _env;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                var response = _env.IsDevelopment()
                    ? new ApiException(context.Response.StatusCode, ex.Message, ex.StackTrace?.ToString())
                    : new ApiException(context.Response.StatusCode, "Internal Server Error");

                // Usar el contexto de serialización generado
                var json = response switch
                {
                    ApiException apiEx => apiEx.ToJson(),
                    _ => JsonSerializer.Serialize(response, response.GetType(), ApiExceptionContext.Options)
                };

                await context.Response.WriteAsync(json);
            }
        }
    }
}