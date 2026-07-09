using Aura.Core.DTOs.Events;
using Aura.Core.Models;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Core.Interfaces.Services;

namespace Aura.Core.Services;

public class EventService : IEventService
{
    private readonly IEventRepository _eventRepository;
    private readonly ISlugGenerator _slugGenerator;
    private readonly IDataRetentionJobRepository _jobRepository;
    
    public EventService(
        IEventRepository eventRepository,
        ISlugGenerator slugGenerator,
        IDataRetentionJobRepository jobRepository)
    {
        _eventRepository = eventRepository;
        _slugGenerator = slugGenerator;
        _jobRepository = jobRepository;
    }

    public async Task<EventResponse> CreateEventAsync(Guid userId, CreateEventRequest request)
    {
        var baseSlug = _slugGenerator.GenerateSlug(request.Name, request.EventDate.Year);
        var finalSlug = await GenerateUniqueSlugAsync(baseSlug);



        var newEvent = new Event
        {
            UserId = userId,
            Name = request.Name,
            Slug = finalSlug,
            TemplateId = request.TemplateId,
            PrimaryColor = request.PrimaryColor,
            SecondaryColor = request.SecondaryColor,
            FontFamily = request.FontFamily,
            CoupleNames = request.CoupleNames,
            EventDate = request.EventDate,
            EventEndDate = request.EventEndDate ?? request.EventDate.AddDays(1),
            VenueName = request.VenueName,
            VenueAddress = request.VenueAddress,
            VenueLat = null,
            VenueLng = null,
            Status = EventStatus.Draft
        };

        await _eventRepository.AddAsync(newEvent);

        var retentionJob = new DataRetentionJob
        {
            EventId = newEvent.Id,
            ScheduledDeleteAt = newEvent.EventEndDate.AddDays(30)
        };
        await _jobRepository.AddAsync(retentionJob);

        return MapToResponse(newEvent);
    }

    public async Task<EventResponse?> GetEventBySlugAsync(string slug, Guid userId)
    {
        var ev = await _eventRepository.GetBySlugAsync(slug);
        if (ev == null || ev.UserId != userId) return null;

        return MapToResponse(ev);
    }

    public async Task<IEnumerable<EventResponse>> GetEventsAsync(Guid userId)
    {
        var events = await _eventRepository.GetByUserIdAsync(userId);
        return events.Select(MapToResponse);
    }

    public async Task<EventResponse?> UpdateEventAsync(string slug, Guid userId, UpdateEventRequest request)
    {
        var ev = await _eventRepository.GetBySlugAsync(slug);
        if (ev == null || ev.UserId != userId) return null;

        if (!string.IsNullOrWhiteSpace(request.VenueAddress) && ev.VenueAddress != request.VenueAddress)
        {
            ev.VenueAddress = request.VenueAddress;
            ev.VenueLat = null;
            ev.VenueLng = null;
        }

        ev.Name = request.Name;
        ev.TemplateId = request.TemplateId;
        ev.PrimaryColor = request.PrimaryColor;
        ev.SecondaryColor = request.SecondaryColor;
        ev.FontFamily = request.FontFamily;
        ev.HeroImageUrl = request.HeroImageUrl;
        ev.CoupleNames = request.CoupleNames;
        ev.EventDate = request.EventDate;
        ev.EventEndDate = request.EventEndDate ?? request.EventDate.AddDays(1);
        ev.VenueName = request.VenueName;
        
        if (request.Status.HasValue)
        {
            ev.Status = request.Status.Value;
        }

        ev.UpdatedAt = DateTimeOffset.UtcNow;

        await _eventRepository.UpdateAsync(ev);
        return MapToResponse(ev);
    }

    public async Task<bool> DeleteEventAsync(string slug, Guid userId)
    {
        var ev = await _eventRepository.GetBySlugAsync(slug);
        if (ev == null || ev.UserId != userId) return false;

        await _eventRepository.DeleteAsync(ev);
        return true;
    }

    private async Task<string> GenerateUniqueSlugAsync(string baseSlug)
    {
        var slug = baseSlug;
        var counter = 2;
        
        while (await _eventRepository.ExistsBySlugAsync(slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }
        
        return slug;
    }

    private EventResponse MapToResponse(Event ev)
    {
        return new EventResponse
        {
            Id = ev.Id,
            Name = ev.Name,
            Slug = ev.Slug,
            TemplateId = ev.TemplateId,
            PrimaryColor = ev.PrimaryColor,
            SecondaryColor = ev.SecondaryColor,
            FontFamily = ev.FontFamily,
            HeroImageUrl = ev.HeroImageUrl,
            CoupleNames = ev.CoupleNames,
            EventDate = ev.EventDate,
            EventEndDate = ev.EventEndDate,
            VenueName = ev.VenueName,
            VenueAddress = ev.VenueAddress,
            VenueLat = ev.VenueLat,
            VenueLng = ev.VenueLng,
            Status = ev.Status,
            GuestCount = ev.Guests?.Count ?? 0,
            PendingRsvps = ev.Guests?.Count(g => g.Invitations == null || !g.Invitations.Any() || g.Invitations.Any(i => i.Rsvp == null || i.Rsvp.Attendance == RsvpAttendance.Maybe)) ?? 0,
            ConfirmedRsvps = ev.Guests?.Count(g => g.Invitations != null && g.Invitations.Any(i => i.Rsvp != null && i.Rsvp.Attendance == RsvpAttendance.Yes)) ?? 0,
            DeclinedRsvps = ev.Guests?.Count(g => g.Invitations != null && g.Invitations.Any(i => i.Rsvp != null && i.Rsvp.Attendance == RsvpAttendance.No)) ?? 0
        };
    }
}
