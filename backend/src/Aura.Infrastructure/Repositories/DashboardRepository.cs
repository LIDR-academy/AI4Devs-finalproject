using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Aura.Core.DTOs.Dashboard;
using Aura.Core.Enums;
using Aura.Core.Interfaces.Repositories;
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Aura.Infrastructure.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly ApplicationDbContext _context;

    public DashboardRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsResponse> GetStatsAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        var guestsQuery = _context.Guests.Where(g => g.EventId == eventId && !g.IsDeleted);
        var rsvpsQuery = _context.Rsvps.Where(r => r.EventId == eventId);

        var totalInvited = await guestsQuery.CountAsync(cancellationToken);
        var rsvps = await rsvpsQuery.ToListAsync(cancellationToken);

        var confirmed = rsvps.Count(r => r.Attendance == RsvpAttendance.Yes);
        var declined = rsvps.Count(r => r.Attendance == RsvpAttendance.No);
        var maybe = rsvps.Count(r => r.Attendance == RsvpAttendance.Maybe);
        
        var pending = totalInvited - rsvps.Count;

        var transportNeedsCount = rsvps.Count(r => r.NeedsTransport);
        var plusOneCount = rsvps.Count(r => r.PlusOne);

        var dietaryRestrictions = await _context.Rsvps
            .Where(r => r.EventId == eventId && !string.IsNullOrWhiteSpace(r.DietaryRestrictions))
            .Join(_context.Guests, r => r.GuestId, g => g.Id, (r, g) => new DietaryRestrictionDto
            {
                GuestName = g.Name,
                Restrictions = r.DietaryRestrictions!
            })
            .ToListAsync(cancellationToken);

        var allGuests = await _context.Guests
            .Where(g => g.EventId == eventId && !g.IsDeleted)
            .ToListAsync(cancellationToken);

        var guestList = allGuests.Select(g => 
        {
            var rsvp = rsvps.FirstOrDefault(r => r.GuestId == g.Id);
            return new GuestExportDto
            {
                Id = g.Id,
                Name = g.Name,
                InviteStatus = g.InviteStatus.ToString(),
                Email = g.Email,
                Phone = g.Phone,
                Category = g.Category.ToString(),
                RsvpStatus = rsvp?.Attendance.ToString() ?? "Pending",
                DietaryRestrictions = rsvp?.DietaryRestrictions,
                TransportNeeds = rsvp?.NeedsTransport ?? false
            };
        }).ToList();

        return new DashboardStatsResponse
        {
            TotalInvited = totalInvited,
            Confirmed = confirmed,
            Declined = declined,
            Pending = pending,
            Maybe = maybe,
            TransportNeedsCount = transportNeedsCount,
            PlusOneCount = plusOneCount,
            DietaryRestrictions = dietaryRestrictions,
            GuestList = guestList
        };
    }

    public async Task<IEnumerable<GuestExportDto>> GetGuestExportDataAsync(Guid eventId, CancellationToken cancellationToken = default)
    {
        var data = await _context.Guests
            .Where(g => g.EventId == eventId && !g.IsDeleted)
            .Select(g => new
            {
                Guest = g,
                Rsvp = _context.Rsvps.FirstOrDefault(r => r.GuestId == g.Id)
            })
            .ToListAsync(cancellationToken);

        return data.Select(d => new GuestExportDto
        {
            Id = d.Guest.Id,
            Name = d.Guest.Name,
            InviteStatus = d.Guest.InviteStatus.ToString(),
            Email = d.Guest.Email,
            Phone = d.Guest.Phone,
            Category = d.Guest.Category.ToString(),
            RsvpStatus = d.Rsvp?.Attendance.ToString() ?? "Pending",
            DietaryRestrictions = d.Rsvp?.DietaryRestrictions,
            TransportNeeds = d.Rsvp?.NeedsTransport ?? false
        });
    }
}
