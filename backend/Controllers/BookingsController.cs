using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InkLink.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly AvailabilityService _availabilityService;

    public BookingsController(AvailabilityService availabilityService)
    {
        _availabilityService = availabilityService;
    }

    /// <summary>
    /// US0008 CA7-CA8 — Holds a slot creating the booking in pending_payment with a 5-minute TTL.
    /// </summary>
    [HttpPost("hold")]
    [Authorize]
    public async Task<IActionResult> Hold(BookingHoldRequest request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirst("user_id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var clientId))
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
}
