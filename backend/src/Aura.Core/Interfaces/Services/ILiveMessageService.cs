using Aura.Core.DTOs.LiveMessages;

namespace Aura.Core.Interfaces.Services;

public interface ILiveMessageService
{
    Task<LiveMessageResponse> SendLiveMessageAsync(Guid accompliceId, string eventSlug, SendLiveMessageRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<LiveMessageResponse>> GetLiveMessagesByEventAsync(string eventSlug, CancellationToken cancellationToken = default);
}
