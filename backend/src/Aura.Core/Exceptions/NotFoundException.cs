namespace Aura.Core.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
    public NotFoundException(string entityName, object entityId)
        : base($"{entityName} with id '{entityId}' was not found.") { }
}
