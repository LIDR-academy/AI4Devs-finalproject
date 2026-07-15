using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InkLink.Api.Controllers;

[ApiController]
[Route("api/bookings/{bookingId:guid}/review")]
[Authorize]
public class ReviewsController : ControllerBase
{
    private readonly ReviewService _reviewService;

    public ReviewsController(ReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    /// <summary>
    /// US0013 — Submits the 4-dimension review for a completed booking (one per booking, immutable).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(
        Guid bookingId, ReviewRequest request, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirst("user_id")?.Value, out var clientId))
        {
            return Unauthorized();
        }

        var result = await _reviewService.CreateAsync(clientId, bookingId, request, cancellationToken);
        return result.Outcome switch
        {
            ReviewOutcome.Created => StatusCode(StatusCodes.Status201Created, result.Review),
            ReviewOutcome.BookingNotFound => NotFound(new { message = "Booking not found", code = "BOOKING_NOT_FOUND" }),
            ReviewOutcome.NotOwner => StatusCode(StatusCodes.Status403Forbidden,
                new { message = "Booking does not belong to the user", code = "NOT_BOOKING_OWNER" }),
            ReviewOutcome.NotCompleted => Conflict(new { message = "Booking is not completed", code = "BOOKING_NOT_COMPLETED" }),
            ReviewOutcome.AlreadyReviewed => Conflict(new { message = "Booking already has a review", code = "REVIEW_ALREADY_EXISTS" }),
            _ => UnprocessableEntity(new { message = result.Error ?? "Invalid review", code = "INVALID_REVIEW" })
        };
    }
}
