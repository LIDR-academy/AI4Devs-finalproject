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

    [HttpGet]
    [Authorize] // Overrides EventOwner policy for this action if necessary, but actually the class level Authorize(Policy = "EventOwner") requires a role, which is true for all logged-in hosts. 
    public async Task<ActionResult<IEnumerable<EventResponse>>> GetEvents()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var events = await _eventService.GetEventsAsync(userId);
        return Ok(events);
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

    [HttpPost("{slug}/upload-hero-image")]
    public async Task<IActionResult> UploadHeroImage(string slug, Microsoft.AspNetCore.Http.IFormFile file, [FromServices] IObjectStorageService objectStorageService)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (file.Length > 5 * 1024 * 1024)
            return BadRequest("Image must be under 5MB");

        var extension = System.IO.Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension != ".jpg" && extension != ".jpeg" && extension != ".png")
            return BadRequest("Only JPG and PNG files are allowed.");

        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();
            
        // Verify user owns event
        var ev = await _eventService.GetEventBySlugAsync(slug, userId);
        if (ev == null) return NotFound();

        using var stream = file.OpenReadStream();
        var objectName = $"events/{slug}/hero{extension}";
        var url = await objectStorageService.UploadFileAsync("uploads", objectName, stream, file.ContentType);

        // Ideally we should update the database here, but the frontend will also call PUT to save all state.
        // Just in case, we could do a partial update, but EventService doesn't have it.
        return Ok(new { url });
    }
}
