using Aura.Core.DTOs.Events;
using Aura.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "EventOwner")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;

    public EventsController(IEventService eventService)
    {
        _eventService = eventService;
    }

    [HttpPost]
    public async Task<ActionResult<EventResponse>> CreateEvent([FromBody] CreateEventRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var response = await _eventService.CreateEventAsync(userId, request);
        return CreatedAtAction(nameof(GetEvent), new { slug = response.Slug }, response);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<EventResponse>> GetEvent(string slug)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var response = await _eventService.GetEventBySlugAsync(slug, userId);
        if (response == null) return NotFound();

        return Ok(response);
    }

    [HttpPut("{slug}")]
    public async Task<ActionResult<EventResponse>> UpdateEvent(string slug, [FromBody] UpdateEventRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var response = await _eventService.UpdateEventAsync(slug, userId, request);
        if (response == null) return NotFound();

        return Ok(response);
    }

    [HttpDelete("{slug}")]
    public async Task<IActionResult> DeleteEvent(string slug)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var success = await _eventService.DeleteEventAsync(slug, userId);
        if (!success) return NotFound();

        return NoContent();
    }
}
