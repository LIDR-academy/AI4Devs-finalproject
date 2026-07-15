using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Invitations;

namespace Aura.Core.Interfaces.Services;

public interface IInvitationService
{
    Task<IEnumerable<InvitationResponse>> GetInvitationsByEventAsync(string eventSlug, CancellationToken cancellationToken = default);
    Task CreateInvitationsForEventAsync(string eventSlug, CancellationToken cancellationToken = default);
    Task SendInvitationsAsync(string eventSlug, CancellationToken cancellationToken = default);
}
