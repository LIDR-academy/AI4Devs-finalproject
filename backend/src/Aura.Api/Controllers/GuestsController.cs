using Aura.Core.DTOs.Guests;
using Aura.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Aura.Api.Controllers;

[ApiController]
[Route("api/events/{slug}/guests")]
[Authorize]
public class GuestsController : ControllerBase
{
    private readonly IGuestService _guestService;

    public GuestsController(IGuestService guestService)
    {
        _guestService = guestService;
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdString, out var userId))
            return userId;
        throw new UnauthorizedAccessException();
    }

    [HttpGet]
    public async Task<IActionResult> GetGuests(string slug, [FromQuery] string? category, [FromQuery] string? search)
    {
        var guests = await _guestService.GetGuestsByEventAsync(GetUserId(), slug, category, search);
        return Ok(guests);
    }

    [HttpPost]
    public async Task<IActionResult> AddGuest(string slug, [FromBody] AddGuestRequest request)
    {
        var guest = await _guestService.AddGuestAsync(GetUserId(), slug, request);
        return CreatedAtAction(nameof(GetGuests), new { slug }, guest);
    }

    [HttpPost("import")]
    public async Task<IActionResult> ImportGuests(string slug, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("A CSV file is required.");

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only .csv files are allowed.");

        using var stream = file.OpenReadStream();
        var result = await _guestService.ImportGuestsFromCsvAsync(GetUserId(), slug, stream);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteGuest(string slug, Guid id)
    {
        await _guestService.SoftDeleteGuestAsync(GetUserId(), slug, id);
        return NoContent();
    }
}
