using System.Net;
using System.Text.Json;
using Aura.Core.Exceptions;
using FluentValidation;

namespace Aura.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);

        var (statusCode, errorBody) = exception switch
        {
            ValidationException validationException => (
                HttpStatusCode.BadRequest,
                (object)new ErrorResponse("Validation failed", null, null, validationException.Errors.Select(e => new ErrorDetail(e.PropertyName, e.ErrorMessage)).ToList())),

            DomainValidationException domainValidation => (
                HttpStatusCode.BadRequest,
                (object)new ErrorResponse("Validation failed", null, null, domainValidation.Errors.SelectMany(kvp => kvp.Value.Select(v => new ErrorDetail(kvp.Key, v))).ToList())),

            UnauthorizedAccessException => (
                HttpStatusCode.Unauthorized,
                (object)new ErrorResponse("Unauthorized", exception.Message)),

            ForbiddenAccessException => (
                HttpStatusCode.Forbidden,
                (object)new ErrorResponse("Forbidden", exception.Message)),

            NotFoundException => (
                HttpStatusCode.NotFound,
                (object)new ErrorResponse("Not found", exception.Message)),

            ConflictException => (
                HttpStatusCode.Conflict,
                (object)new ErrorResponse("Conflict", exception.Message)),

            RateLimitExceededException rateLimit => (
                HttpStatusCode.TooManyRequests,
                (object)new ErrorResponse("Rate limit exceeded", exception.Message, rateLimit.RetryAfterSeconds)),

            _ => (
                HttpStatusCode.InternalServerError,
                env.IsDevelopment()
                    ? (object)new ErrorResponse("An unexpected error occurred", exception.Message)
                    : (object)new ErrorResponse("An unexpected error occurred", "An internal error has occurred."))
        };

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        if (exception is RateLimitExceededException rateLimitEx)
        {
            context.Response.Headers.RetryAfter = rateLimitEx.RetryAfterSeconds.ToString();
        }

        var json = JsonSerializer.Serialize(errorBody, JsonOptions);
        await context.Response.WriteAsync(json);
    }
}

public record ErrorResponse(string Error, string? Message = null, int? RetryAfterSeconds = null, List<ErrorDetail>? Errors = null);
public record ErrorDetail(string Field, string Message);
