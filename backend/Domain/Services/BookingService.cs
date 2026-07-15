using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Domain.Services;

public enum BookingActionOutcome
{
    Ok,
    NotFound,
    NotOwner,
    InvalidState
}

public record BookingActionResult(BookingActionOutcome Outcome, BookingDto? Booking = null, string? Error = null);

/// <summary>US0010 — Client booking history, attendance confirmation and cancellation.</summary>
public class BookingService
{
    private readonly InkLinkDbContext _context;

    public BookingService(InkLinkDbContext context)
    {
        _context = context;
    }

    /// <summary>Returns a booking owned by the client (US0009 confirmation screen / US0010 CA5 detail).</summary>
    public async Task<BookingDto?> GetBookingAsync(
        Guid clientId, Guid bookingId, CancellationToken cancellationToken = default)
    {
        var booking = await _context.Bookings
            .AsNoTracking()
            .Include(b => b.ArtistProfile).ThenInclude(p => p.User)
            .Include(b => b.Style)
            .Include(b => b.Review)
            .SingleOrDefaultAsync(b => b.Id == bookingId && b.ClientId == clientId, cancellationToken);
        return booking is null ? null : BookingMapper.ToDto(booking, booking.ArtistProfile, booking.Style?.Name);
    }

    /// <summary>
    /// US0010 CA2-CA3 — History ordered with upcoming bookings first (ascending), then past ones
    /// (descending). Ordering and paging happen in memory: a client's history is small by nature.
    /// </summary>
    public async Task<BookingListResponse> ListMyBookingsAsync(
        Guid clientId, string? status, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        // Expired holds are dead bookings (the slot is already released, US0008 CA8):
        // they must not surface in the history. Live holds do appear so the client can resume payment.
        var now = DateTime.UtcNow;
        var query = _context.Bookings
            .AsNoTracking()
            .Include(b => b.ArtistProfile).ThenInclude(p => p.User)
            .Include(b => b.Style)
            .Include(b => b.Review)
            .Where(b => b.ClientId == clientId
                && (b.Status != BookingStatus.PendingPayment || b.ExpiresAt > now));

        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusFilter = ParseStatus(status);
            if (statusFilter is null)
            {
                return new BookingListResponse(new List<BookingDto>(), 0, page, pageSize);
            }
            query = query.Where(b => b.Status == statusFilter);
        }

        var bookings = await query.ToListAsync(cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var ordered = bookings
            .OrderBy(b => b.BookingDate < today)
            .ThenBy(b => b.BookingDate < today ? default : b.BookingDate)
            .ThenBy(b => b.BookingDate < today ? default : b.StartTime)
            .ThenByDescending(b => b.BookingDate < today ? b.BookingDate : default)
            .ThenByDescending(b => b.BookingDate < today ? b.StartTime : default)
            .ToList();

        var data = ordered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => BookingMapper.ToDto(b, b.ArtistProfile, b.Style?.Name))
            .ToList();

        return new BookingListResponse(data, ordered.Count, page, pageSize);
    }

    /// <summary>US0010 CA8-CA9 — Confirms attendance: confirmed + session already over → completed.</summary>
    public Task<BookingActionResult> CompleteAsync(
        Guid clientId, Guid bookingId, CancellationToken cancellationToken = default) =>
        TransitionAsync(clientId, bookingId, cancellationToken, booking =>
        {
            if (booking.Status != BookingStatus.Confirmed)
            {
                return "Booking is not confirmed";
            }
            var sessionEnd = booking.BookingDate.ToDateTime(booking.EndTime, DateTimeKind.Utc);
            if (sessionEnd > DateTime.UtcNow)
            {
                return "Booking date has not passed yet";
            }
            booking.Status = BookingStatus.Completed;
            return null;
        });

    /// <summary>
    /// US0010 CA10-CA11 — Cancels a confirmed future booking. The slot becomes available again
    /// (availability only excludes confirmed/pending bookings). No automatic deposit refund in the MVP.
    /// </summary>
    public Task<BookingActionResult> CancelAsync(
        Guid clientId, Guid bookingId, CancellationToken cancellationToken = default) =>
        TransitionAsync(clientId, bookingId, cancellationToken, booking =>
        {
            if (booking.Status != BookingStatus.Confirmed)
            {
                return "Booking is not confirmed";
            }
            var sessionStart = booking.BookingDate.ToDateTime(booking.StartTime, DateTimeKind.Utc);
            if (sessionStart <= DateTime.UtcNow)
            {
                return "Booking date already passed";
            }
            booking.Status = BookingStatus.Cancelled;
            booking.CancelledAt = DateTime.UtcNow;
            return null;
        });

    private async Task<BookingActionResult> TransitionAsync(
        Guid clientId, Guid bookingId, CancellationToken cancellationToken,
        Func<Entities.Booking, string?> transition)
    {
        var booking = await _context.Bookings
            .Include(b => b.ArtistProfile).ThenInclude(p => p.User)
            .Include(b => b.Style)
            .Include(b => b.Review)
            .SingleOrDefaultAsync(b => b.Id == bookingId, cancellationToken);
        if (booking is null)
        {
            return new BookingActionResult(BookingActionOutcome.NotFound);
        }
        if (booking.ClientId != clientId)
        {
            return new BookingActionResult(BookingActionOutcome.NotOwner);
        }

        var error = transition(booking);
        if (error is not null)
        {
            return new BookingActionResult(BookingActionOutcome.InvalidState, Error: error);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return new BookingActionResult(
            BookingActionOutcome.Ok,
            BookingMapper.ToDto(booking, booking.ArtistProfile, booking.Style?.Name));
    }

    private static BookingStatus? ParseStatus(string status) => status switch
    {
        "pending_payment" => BookingStatus.PendingPayment,
        "confirmed" => BookingStatus.Confirmed,
        "completed" => BookingStatus.Completed,
        "cancelled" => BookingStatus.Cancelled,
        _ => null
    };
}
