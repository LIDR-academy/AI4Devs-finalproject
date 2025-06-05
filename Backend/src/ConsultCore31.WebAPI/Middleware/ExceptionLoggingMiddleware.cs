using System.Net;
using System.Text.Json;

namespace ConsultCore31.WebAPI.Middleware;

/// <summary>
/// Middleware para registrar y manejar excepciones de forma centralizada
/// </summary>
public class ExceptionLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionLoggingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public ExceptionLoggingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionLoggingMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // Generar un ID de correlación para seguimiento de solicitudes
            var correlationId = Guid.NewGuid().ToString();
            context.Response.Headers.Append("X-Correlation-ID", correlationId);
            
            // Registrar información de la solicitud entrante
            _logger.LogInformation(
                "Solicitud recibida: {Method} {Path} | CorrelationId: {CorrelationId} | IP: {IpAddress}",
                context.Request.Method,
                context.Request.Path,
                correlationId,
                context.Connection.RemoteIpAddress);

            // Medir el tiempo de respuesta
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            // Continuar con el pipeline
            await _next(context);
            
            stopwatch.Stop();
            
            // Registrar información de la respuesta
            _logger.LogInformation(
                "Respuesta enviada: {StatusCode} | CorrelationId: {CorrelationId} | Duración: {ElapsedMs}ms",
                context.Response.StatusCode,
                correlationId,
                stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = context.Response.Headers["X-Correlation-ID"].FirstOrDefault() ?? Guid.NewGuid().ToString();
        
        // Registrar la excepción con detalles completos
        _logger.LogError(
            exception,
            "Error no controlado | CorrelationId: {CorrelationId} | Ruta: {Path} | Método: {Method} | Mensaje: {Message}",
            correlationId,
            context.Request.Path,
            context.Request.Method,
            exception.Message);

        // Registrar información adicional sobre el contexto
        try
        {
            var user = context.User?.Identity?.Name ?? "Anónimo";
            _logger.LogError(
                "Contexto adicional | CorrelationId: {CorrelationId} | Usuario: {User} | UserAgent: {UserAgent}",
                correlationId,
                user,
                context.Request.Headers["User-Agent"].ToString());
        }
        catch
        {
            // Ignorar errores al intentar registrar información adicional
        }

        // Preparar la respuesta de error
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        // Crear una respuesta de error apropiada según el entorno
        var response = _environment.IsDevelopment()
            ? new
            {
                status = context.Response.StatusCode,
                message = exception.Message,
                detail = exception.StackTrace,
                correlationId
            }
            : new
            {
                status = context.Response.StatusCode,
                message = "Se produjo un error interno en el servidor.",
                detail = "", // Añadir campo detail vacío para que los tipos coincidan
                correlationId
            };

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}

// Extensión para agregar el middleware a la aplicación
public static class ExceptionLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ExceptionLoggingMiddleware>();
    }
}