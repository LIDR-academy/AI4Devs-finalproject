using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InkLink.Api.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly AvailabilityService _availabilityService;
    private readonly BookingService _bookingService;

    public BookingsController(AvailabilityService availabilityService, BookingService bookingService)
    {
        _availabilityService = availabilityService;
        _bookingService = bookingService;
    }

    /// <summary>US0010 CA1-CA3 — Authenticated client's booking history (upcoming first, then past).</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMyBookings(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserId(out var clientId))
        {
            return Unauthorized();
        }
        var response = await _bookingService.ListMyBookingsAsync(clientId, status, page, pageSize, cancellationToken);
        return Ok(response);
    }

    /// <summary>US0009 CA4 / US0010 CA5 — Booking detail for the authenticated owner.</summary>
    [HttpGet("{bookingId:guid}")]
    public async Task<IActionResult> GetBooking(Guid bookingId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var clientId))
        {
            return Unauthorized();
        }

        var booking = await _bookingService.GetBookingAsync(clientId, bookingId, cancellationToken);
        if (booking is null)
        {
            return NotFound(new { message = "Booking not found", code = "BOOKING_NOT_FOUND" });
        }
        return Ok(booking);
    }

    /// <summary>US0010 CA8-CA9 — Client confirms attendance (confirmed + past date → completed).</summary>
    [HttpPost("{bookingId:guid}/complete")]
    public async Task<IActionResult> Complete(Guid bookingId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var clientId))
        {
            return Unauthorized();
        }
        var result = await _bookingService.CompleteAsync(clientId, bookingId, cancellationToken);
        return ToActionResult(result);
    }

    /// <summary>US0010 CA10-CA11 — Client cancels a confirmed future booking (slot is released).</summary>
    [HttpPost("{bookingId:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid bookingId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var clientId))
        {
            return Unauthorized();
        }
        var result = await _bookingService.CancelAsync(clientId, bookingId, cancellationToken);
        return ToActionResult(result);
    }

    /// <summary>
    /// US0008 CA7-CA8 — Holds a slot creating the booking in pending_payment with a 5-minute TTL.
    /// </summary>
    [HttpPost("hold")]
    public async Task<IActionResult> Hold(BookingHoldRequest request, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var clientId))
        {
            return Unauthorized();
        }

        var result = await _availabilityService.CreateHoldAsync(clientId, request, cancellationToken);
        return result.Outcome switch
        {
            HoldOutcome.Created => StatusCode(StatusCodes.Status201Created, result.Booking),
            HoldOutcome.ArtistNotFound => NotFound(new { message = "Artist not found", code = "ARTIST_NOT_FOUND" }),
            HoldOutcome.SlotTaken => Conflict(new { message = "Slot no longer available", code = "SLOT_TAKEN" }),
            _ => UnprocessableEntity(new { message = result.Error ?? "Invalid slot", code = "INVALID_SLOT" })
        };
    }

    private IActionResult ToActionResult(BookingActionResult result) => result.Outcome switch
    {
        BookingActionOutcome.Ok => Ok(result.Booking),
        BookingActionOutcome.NotFound => NotFound(new { message = "Booking not found", code = "BOOKING_NOT_FOUND" }),
        BookingActionOutcome.NotOwner => StatusCode(StatusCodes.Status403Forbidden,
            new { message = "Booking does not belong to the user", code = "NOT_BOOKING_OWNER" }),
        _ => Conflict(new { message = result.Error ?? "Invalid booking state", code = "INVALID_BOOKING_STATE" })
    };

    private bool TryGetUserId(out Guid userId) =>
        Guid.TryParse(User.FindFirst("user_id")?.Value, out userId);
}
