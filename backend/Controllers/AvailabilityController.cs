using InkLink.Api.Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace InkLink.Api.Controllers;

[ApiController]
[Route("api/artists/{artistProfileId:guid}/availability")]
public class AvailabilityController : ControllerBase
{
    private readonly AvailabilityService _service;

    public AvailabilityController(AvailabilityService service)
    {
        _service = service;
    }

    /// <summary>
    /// US0008 CA1-CA3 — Bookable slots for the requested week (Monday date).
    /// Public endpoint; any date is normalized to the Monday of its week.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetWeekAvailability(
        Guid artistProfileId,
        [FromQuery] DateOnly week,
        CancellationToken cancellationToken)
    {
        var response = await _service.GetWeekAvailabilityAsync(artistProfileId, week, cancellationToken);
        if (response is null)
        {
            return NotFound(new { message = "Artist not found", code = "ARTIST_NOT_FOUND" });
        }
        return Ok(response);
    }
}
