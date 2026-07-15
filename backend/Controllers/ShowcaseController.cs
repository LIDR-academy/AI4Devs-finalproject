using InkLink.Api.Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace InkLink.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShowcaseController : ControllerBase
{
    private readonly ShowcaseService _service;

    public ShowcaseController(ShowcaseService service)
    {
        _service = service;
    }

    /// <summary>
    /// US0003 — Returns the four showcase sections for the landing page.
    /// Public endpoint — no authentication required (CA8).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetShowcase(
        [FromQuery] double? lat,
        [FromQuery] double? lng,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.GetShowcaseAsync(lat, lng);
        return Ok(result);
    }
}
