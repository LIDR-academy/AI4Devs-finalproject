namespace Aura.Core.Exceptions;

public class DomainValidationException : Exception
{
    public Dictionary<string, string[]> Errors { get; }

    public DomainValidationException(string message) : base(message)
    {
        Errors = new Dictionary<string, string[]>();
    }

    public DomainValidationException(Dictionary<string, string[]> errors)
        : base("One or more validation errors occurred.")
    {
        Errors = errors;
    }
}
