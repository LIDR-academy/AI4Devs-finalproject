using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace InkLink.Api.Controllers;

[ApiController]
[Route("api/quotes")]
public class QuotesController : ControllerBase
{
    private readonly QuoteCalculatorService _service;

    public QuotesController(QuoteCalculatorService service)
    {
        _service = service;
    }

    /// <summary>
    /// US0011 CA3-CA4 — Deterministic price range from the artist's tariffs plus
    /// complexity factors. Public endpoint (no login required).
    /// </summary>
    [HttpPost("calculate")]
    public async Task<IActionResult> Calculate([FromBody] QuoteRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.CalculateAsync(request, cancellationToken);
        return result.Outcome switch
        {
            QuoteOutcome.Ok => Ok(result.Response),
            QuoteOutcome.ArtistNotFound => NotFound(new { message = "Artist not found", code = "ARTIST_NOT_FOUND" }),
            QuoteOutcome.StyleNotFound => NotFound(new { message = "Style not found", code = "STYLE_NOT_FOUND" }),
            _ => UnprocessableEntity(new { message = "Invalid size reference", code = "INVALID_SIZE" })
        };
    }
}
