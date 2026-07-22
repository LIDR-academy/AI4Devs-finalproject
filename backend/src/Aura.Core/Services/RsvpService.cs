using System.Security.Cryptography;
using System.Text;
using Aura.Core.DTOs.Rsvp;
using Aura.Core.Enums;
using Aura.Core.Exceptions;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;

namespace Aura.Core.Services;

public class RsvpService : IRsvpService
{
    private readonly IInvitationRepository _invitationRepository;
    private readonly IRsvpRepository _rsvpRepository;

    public RsvpService(IInvitationRepository invitationRepository, IRsvpRepository rsvpRepository)
    {
        _invitationRepository = invitationRepository;
        _rsvpRepository = rsvpRepository;
    }

    public async Task<RsvpInfoResponse> GetRsvpInfoAsync(string token, CancellationToken cancellationToken = default)
    {
        var tokenHash = ComputeSha256Hash(token);
        var invitation = await _invitationRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (invitation == null)
        {
            throw new NotFoundException("This invitation link is not valid.");
        }

        var evt = invitation.Event;
        var guest = invitation.Guest;
        var rsvp = invitation.Rsvp;

        var deadlinePassed = DateTimeOffset.UtcNow > evt.EventDate.AddDays(-7);

        ExistingRsvpDto? existingRsvp = null;
        if (rsvp != null)
        {
            existingRsvp = new ExistingRsvpDto(
                rsvp.Attendance,
                rsvp.DietaryRestrictions,
                rsvp.NeedsTransport,
                rsvp.PlusOne,
                null, // PlusOneName is not tracked in current model
                rsvp.Message
            );
        }

        return new RsvpInfoResponse(
            guest.Name,
            evt.Name,
            evt.CoupleNames,
            evt.EventDate,
            evt.VenueName,
            evt.VenueAddress,
            existingRsvp,
            deadlinePassed
        );
    }

    public async Task<RsvpConfirmationResponse> SubmitRsvpAsync(string token, SubmitRsvpRequest request, CancellationToken cancellationToken = default)
    {
        var tokenHash = ComputeSha256Hash(token);
        var invitation = await _invitationRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (invitation == null)
        {
            throw new NotFoundException("This invitation link is not valid.");
        }

        var evt = invitation.Event;
        var deadline = evt.EventDate.AddDays(-7);
        if (DateTimeOffset.UtcNow > deadline)
        {
            throw new ForbiddenAccessException("RSVP deadline has passed.");
        }

        var rsvp = invitation.Rsvp;
        if (rsvp != null)
        {
            // UPSERT - Update existing
            rsvp.Attendance = request.Attendance;
            rsvp.DietaryRestrictions = request.DietaryRestrictions;
            rsvp.NeedsTransport = request.NeedsTransport;
            rsvp.PlusOne = request.BringingPlusOne;
            rsvp.Message = request.PersonalMessage;
            rsvp.UpdatedAt = DateTimeOffset.UtcNow;

            await _rsvpRepository.UpdateAsync(rsvp, cancellationToken);
        }
        else
        {
            // UPSERT - Create new
            rsvp = new Rsvp
            {
                InvitationId = invitation.Id,
                GuestId = invitation.GuestId,
                EventId = invitation.EventId,
                Attendance = request.Attendance,
                DietaryRestrictions = request.DietaryRestrictions,
                NeedsTransport = request.NeedsTransport,
                PlusOne = request.BringingPlusOne,
                Message = request.PersonalMessage,
                SubmittedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _rsvpRepository.AddAsync(rsvp, cancellationToken);
        }

        return new RsvpConfirmationResponse(
            rsvp.Id,
            invitation.Guest.Name,
            rsvp.Attendance,
            evt.Name
        );
    }

    private string ComputeSha256Hash(string rawData)
    {
        using (SHA256 sha256Hash = SHA256.Create())
        {
            byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < bytes.Length; i++)
            {
                builder.Append(bytes[i].ToString("x2"));
            }
            return builder.ToString();
        }
    }
}
