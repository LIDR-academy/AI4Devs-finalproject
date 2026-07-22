using Aura.Core.DTOs.Rsvp;

namespace Aura.Core.Interfaces.Services;

public interface IRsvpService
{
    Task<RsvpInfoResponse> GetRsvpInfoAsync(string token, CancellationToken cancellationToken = default);
    Task<RsvpConfirmationResponse> SubmitRsvpAsync(string token, SubmitRsvpRequest request, CancellationToken cancellationToken = default);
}
