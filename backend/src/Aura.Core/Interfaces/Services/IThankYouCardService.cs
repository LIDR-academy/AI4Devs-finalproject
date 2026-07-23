namespace Aura.Core.Interfaces.Services;

public interface IThankYouCardService
{
    Task ProcessAutomatedThankYouCardsAsync(CancellationToken cancellationToken = default);
}
