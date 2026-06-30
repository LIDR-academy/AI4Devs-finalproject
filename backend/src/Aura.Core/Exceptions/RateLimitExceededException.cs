namespace Aura.Core.Exceptions;

public class RateLimitExceededException : Exception
{
    public int RetryAfterSeconds { get; }

    public RateLimitExceededException(int retryAfterSeconds)
        : base("Rate limit exceeded. Please try again later.")
    {
        RetryAfterSeconds = retryAfterSeconds;
    }

    public RateLimitExceededException(string message, int retryAfterSeconds)
        : base(message)
    {
        RetryAfterSeconds = retryAfterSeconds;
    }
}
