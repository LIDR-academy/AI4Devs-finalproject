using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Email;
using Aura.Core.DTOs.Invitations;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;
using Aura.Core.Models;
using Microsoft.Extensions.Configuration;

namespace Aura.Core.Services;

public class InvitationService : IInvitationService
{
    private readonly IEventRepository _eventRepository;
    private readonly IGuestRepository _guestRepository;
    private readonly IInvitationRepository _invitationRepository;
    private readonly IQueueService _queueService;
    private readonly string _frontendBaseUrl;

    public InvitationService(
        IEventRepository eventRepository,
        IGuestRepository guestRepository,
        IInvitationRepository invitationRepository,
        IQueueService queueService,
        IConfiguration configuration)
    {
        _eventRepository = eventRepository;
        _guestRepository = guestRepository;
        _invitationRepository = invitationRepository;
        _queueService = queueService;
        _frontendBaseUrl = configuration["FrontendBaseUrl"] ?? "http://localhost:4200";
    }

    public async Task<IEnumerable<InvitationResponse>> GetInvitationsByEventAsync(string eventSlug, CancellationToken cancellationToken = default)
    {
        var evt = await _eventRepository.GetBySlugAsync(eventSlug);
        if (evt == null) throw new Exception("Event not found");

        // Usually we'd have a specific method in repository, but for MVP we can get guests and their invitations
        var guests = await _guestRepository.GetGuestsByEventAsync(evt.Id);
        var invitations = await _invitationRepository.GetAllAsync(cancellationToken);
        
        var eventInvitations = invitations.Where(i => i.EventId == evt.Id).ToList();

        var response = guests.Select(g => {
            var inv = eventInvitations.FirstOrDefault(i => i.GuestId == g.Id && !i.IsDeleted);
            return new InvitationResponse
            {
                Id = inv?.Id ?? Guid.Empty,
                GuestId = g.Id,
                GuestName = g.Name,
                GuestEmail = g.Email,
                SentVia = inv?.SentVia,
                SentAt = inv?.SentAt,
                DeliveryStatus = inv?.DeliveryStatus ?? DeliveryStatus.Pending
            };
        });

        return response;
    }

    public async Task CreateInvitationsForEventAsync(string eventSlug, CancellationToken cancellationToken = default)
    {
        await Task.CompletedTask;
    }

    public async Task SendInvitationsAsync(string eventSlug, CancellationToken cancellationToken = default)
    {
        var evt = await _eventRepository.GetBySlugAsync(eventSlug);
        if (evt == null) throw new Exception("Event not found");

        var guests = await _guestRepository.GetGuestsByEventAsync(evt.Id);
        var existingInvitations = await _invitationRepository.GetAllAsync(cancellationToken);
        
        // Find guests who have emails and don't have an invitation yet
        var guestsToInvite = guests.Where(g => 
            !string.IsNullOrWhiteSpace(g.Email) && 
            !existingInvitations.Any(i => i.GuestId == g.Id && i.EventId == evt.Id && !i.IsDeleted)
        ).ToList();

        foreach (var guest in guestsToInvite)
        {
            // Generate secure token
            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var plainToken = Convert.ToBase64String(tokenBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", ""); // URL safe base64
                
            var tokenHash = ComputeSha256Hash(plainToken);

            var invitation = new Invitation
            {
                Id = Guid.NewGuid(),
                EventId = evt.Id,
                GuestId = guest.Id,
                TokenHash = tokenHash,
                SentVia = Channel.Email,
                SentAt = DateTimeOffset.UtcNow,
                DeliveryStatus = DeliveryStatus.Pending,
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _invitationRepository.AddAsync(invitation, cancellationToken);

            // Enqueue email
            var rsvpLink = $"{_frontendBaseUrl}/rsvp/{plainToken}";
            
            var payload = new EmailMessagePayload
            {
                Type = "invitation",
                To = guest.Email!,
                Subject = $"You're invited to {evt.Name}!",
                TemplateName = "invitation-email",
                Tokens = new Dictionary<string, string>
                {
                    { "guestName", guest.Name },
                    { "rsvpLink", rsvpLink },
                    { "eventName", evt.Name },
                    { "coupleNames", "the couple" } // Ideally from event settings
                },
                EventId = evt.Id,
                EntityType = "invitation",
                EntityId = invitation.Id
            };

            var messageJson = JsonSerializer.Serialize(payload);
            await _queueService.EnqueueAsync("email:queue", messageJson);
        }
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
