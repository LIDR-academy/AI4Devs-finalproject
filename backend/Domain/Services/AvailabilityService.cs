using System.Globalization;
using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Domain.Services;

public enum HoldOutcome
{
    Created,
    ArtistNotFound,
    SlotTaken,
    InvalidSlot
}

public record HoldResult(HoldOutcome Outcome, BookingDto? Booking = null, string? Error = null);

/// <summary>
/// US0008 — Computes bookable weekly slots and creates 5-minute holds (bookings in pending_payment).
/// Expired holds are cleaned up lazily: ignored when reading availability and deleted when a new hold is placed.
/// </summary>
public class AvailabilityService
{
    private static readonly TimeSpan HoldTtl = TimeSpan.FromMinutes(5);

    private readonly InkLinkDbContext _context;

    public AvailabilityService(InkLinkDbContext context)
    {
        _context = context;
    }

    public async Task<WeekAvailabilityResponse?> GetWeekAvailabilityAsync(
        Guid artistProfileId, DateOnly week, CancellationToken cancellationToken = default)
    {
        var weekStart = ToMonday(week);
        var weekEnd = weekStart.AddDays(6);

        var artist = await _context.ArtistProfiles
            .AsNoTracking()
            .Include(a => a.Availabilities.Where(av => av.IsActive))
            .SingleOrDefaultAsync(a => a.Id == artistProfileId && a.IsPublished, cancellationToken);
        if (artist is null)
        {
            return null;
        }

        var now = DateTime.UtcNow;
        var blockedDates = await _context.BlockedDates
            .AsNoTracking()
            .Where(b => b.ArtistProfileId == artistProfileId && b.Date >= weekStart && b.Date <= weekEnd)
            .Select(b => b.Date)
            .ToListAsync(cancellationToken);
        var busyBookings = await _context.Bookings
            .AsNoTracking()
            .Where(b => b.ArtistProfileId == artistProfileId
                && b.BookingDate >= weekStart && b.BookingDate <= weekEnd
                && (b.Status == BookingStatus.Confirmed
                    || (b.Status == BookingStatus.PendingPayment && b.ExpiresAt > now)))
            .Select(b => new { b.BookingDate, b.StartTime, b.EndTime })
            .ToListAsync(cancellationToken);

        var slots = new List<BookableSlotDto>();
        for (var offset = 0; offset < 7; offset++)
        {
            var date = weekStart.AddDays(offset);
            var isBlocked = blockedDates.Contains(date);
            foreach (var availability in artist.Availabilities.Where(a => a.DayOfWeek == offset).OrderBy(a => a.StartTime))
            {
                foreach (var (start, end) in GenerateSlots(availability))
                {
                    var isPast = date.ToDateTime(start, DateTimeKind.Utc) <= now;
                    var isBusy = busyBookings.Any(b =>
                        b.BookingDate == date && start < b.EndTime && end > b.StartTime);
                    slots.Add(new BookableSlotDto(
                        date,
                        start.ToString("HH:mm"),
                        end.ToString("HH:mm"),
                        IsAvailable: !isBlocked && !isBusy && !isPast));
                }
            }
        }

        return new WeekAvailabilityResponse(weekStart, slots);
    }

    public async Task<HoldResult> CreateHoldAsync(
        Guid clientId, BookingHoldRequest request, CancellationToken cancellationToken = default)
    {
        if (!TryParseTime(request.StartTime, out var start) || !TryParseTime(request.EndTime, out var end) || end <= start)
        {
            return new HoldResult(HoldOutcome.InvalidSlot, Error: "Invalid start/end time");
        }

        var artist = await _context.ArtistProfiles
            .Include(a => a.User)
            .Include(a => a.Availabilities.Where(av => av.IsActive))
            .SingleOrDefaultAsync(a => a.Id == request.ArtistProfileId && a.IsPublished, cancellationToken);
        if (artist is null)
        {
            return new HoldResult(HoldOutcome.ArtistNotFound);
        }

        var now = DateTime.UtcNow;
        if (request.BookingDate.ToDateTime(start, DateTimeKind.Utc) <= now)
        {
            return new HoldResult(HoldOutcome.InvalidSlot, Error: "Slot is in the past");
        }

        // 0=Monday ... 6=Sunday (per data model)
        var dayOfWeek = ((int)request.BookingDate.DayOfWeek + 6) % 7;
        var matchesGrid = artist.Availabilities
            .Where(a => a.DayOfWeek == dayOfWeek)
            .SelectMany(GenerateSlots)
            .Any(s => s.Start == start && s.End == end);
        if (!matchesGrid)
        {
            return new HoldResult(HoldOutcome.InvalidSlot, Error: "Slot is outside the artist's availability");
        }

        // Serialize concurrent holds per artist to avoid double-booking (race condition)
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        await _context.Database.ExecuteSqlAsync(
            $"SELECT id FROM artist_profiles WHERE id = {artist.Id} FOR UPDATE", cancellationToken);

        // Lazy cleanup: expired holds release their slot (CA8)
        await _context.Bookings
            .Where(b => b.ArtistProfileId == artist.Id
                && b.Status == BookingStatus.PendingPayment
                && b.ExpiresAt <= now)
            .ExecuteDeleteAsync(cancellationToken);

        var isBlocked = await _context.BlockedDates.AnyAsync(
            b => b.ArtistProfileId == artist.Id && b.Date == request.BookingDate, cancellationToken);
        var isBusy = await _context.Bookings.AnyAsync(b =>
            b.ArtistProfileId == artist.Id
            && b.BookingDate == request.BookingDate
            && (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.PendingPayment)
            && start < b.EndTime && end > b.StartTime, cancellationToken);
        if (isBlocked || isBusy)
        {
            await transaction.RollbackAsync(cancellationToken);
            return new HoldResult(HoldOutcome.SlotTaken);
        }

        var durationHours = (decimal)(end - start).TotalHours;
        var estimatedMin = artist.MinSessionPrice;
        var estimatedMax = Math.Max(estimatedMin, (int)(artist.HourlyRate * durationHours));
        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            ClientId = clientId,
            ArtistProfileId = artist.Id,
            BookingDate = request.BookingDate,
            StartTime = start,
            EndTime = end,
            Status = BookingStatus.PendingPayment,
            EstimatedPriceMin = estimatedMin,
            EstimatedPriceMax = estimatedMax,
            DepositAmount = estimatedMin * artist.DepositPercentage / 100,
            BodyZone = request.BodyZone,
            SizeReference = request.SizeReference,
            StyleId = request.StyleId,
            IsColor = request.IsColor,
            IsCoverup = request.IsCoverup,
            ReferenceImages = request.ReferenceImageUrls ?? new List<string>(),
            Notes = request.Notes,
            CreatedAt = now,
            ExpiresAt = now.Add(HoldTtl)
        };
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        string? styleName = null;
        if (booking.StyleId is not null)
        {
            styleName = await _context.TattooStyles
                .Where(s => s.Id == booking.StyleId)
                .Select(s => s.Name)
                .SingleOrDefaultAsync(cancellationToken);
        }

        return new HoldResult(HoldOutcome.Created, ToDto(booking, artist, styleName));
    }

    private static BookingDto ToDto(Booking booking, ArtistProfile artist, string? styleName) => new(
        booking.Id,
        booking.ClientId,
        new ArtistSummaryDto(
            artist.Id,
            $"{artist.User.FirstName} {artist.User.LastName}",
            artist.Slug,
            artist.User.AvatarUrl),
        "pending_payment",
        booking.BookingDate,
        booking.StartTime.ToString("HH:mm"),
        booking.EndTime.ToString("HH:mm"),
        booking.EstimatedPriceMin,
        booking.EstimatedPriceMax,
        booking.DepositAmount,
        booking.BodyZone,
        booking.SizeReference,
        booking.StyleId,
        styleName,
        booking.IsColor,
        booking.IsCoverup,
        booking.ReferenceImages,
        booking.Notes,
        HasReview: false,
        booking.CreatedAt,
        booking.ExpiresAt);

    private static IEnumerable<(TimeOnly Start, TimeOnly End)> GenerateSlots(Availability availability)
    {
        if (availability.SlotDurationMinutes <= 0)
        {
            yield break;
        }

        var start = availability.StartTime;
        while (true)
        {
            var end = start.AddMinutes(availability.SlotDurationMinutes);
            if (end > availability.EndTime || end <= start)
            {
                yield break;
            }
            yield return (start, end);
            start = end;
        }
    }

    private static bool TryParseTime(string value, out TimeOnly time) =>
        TimeOnly.TryParseExact(value, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out time);

    private static DateOnly ToMonday(DateOnly date) =>
        date.AddDays(-(((int)date.DayOfWeek + 6) % 7));
}
