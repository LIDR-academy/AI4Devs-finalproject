using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace InkLink.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtistsController : ControllerBase
{
    private readonly ArtistQueryService _service;

    public ArtistsController(ArtistQueryService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetArtists([FromQuery] ArtistFilterRequest request)
    {
        if (!IsValidRequest(request))
        {
            return BadRequest(new { message = "Invalid request", code = "VALIDATION_ERROR" });
        }

        var result = await _service.GetArtistsAsync(request);
        return Ok(result);
    }

    [HttpGet("suggestions")]
    public async Task<IActionResult> GetSuggestions([FromQuery] string? q)
    {
        var result = await _service.GetSuggestionsAsync(q ?? string.Empty);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetArtistProfile(string slug)
    {
        var result = await _service.GetArtistBySlugAsync(slug);
        if (result is null)
            return NotFound(new { code = "ARTIST_NOT_FOUND" });
        return Ok(result);
    }

    [HttpGet("{slug}/reviews")]
    public async Task<IActionResult> GetArtistReviews(string slug, [FromQuery] int page = 1, [FromQuery] int pageSize = 5)
    {
        pageSize = Math.Clamp(pageSize, 1, 20);
        page = Math.Max(page, 1);
        var result = await _service.GetArtistReviewsAsync(slug, page, pageSize);
        if (result is null)
            return NotFound(new { code = "ARTIST_NOT_FOUND" });
        return Ok(result);
    }

    private static bool IsValidRequest(ArtistFilterRequest request)
    {
        if (request.MinPrice is < 0 || request.MaxPrice is < 0)
        {
            return false;
        }

        if (request.MinRating.HasValue && (request.MinRating < 1m || request.MinRating > 5m))
        {
            return false;
        }

        if (request.Page < 1 || request.PageSize < 1)
        {
            return false;
        }

        if (request.MinPrice.HasValue
            && request.MaxPrice.HasValue
            && request.MinPrice.Value > request.MaxPrice.Value)
        {
            return false;
        }

        return string.IsNullOrWhiteSpace(request.Type)
            || Enum.TryParse<ArtistType>(request.Type, true, out _);
    }
}
