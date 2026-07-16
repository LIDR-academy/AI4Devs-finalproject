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
    private readonly GeoService _geoService;

    public ArtistsController(ArtistQueryService service, GeoService geoService)
    {
        _service = service;
        _geoService = geoService;
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

    /// <summary>US0012 — Artists within a geo radius using PostGIS ST_DWithin.</summary>
    [HttpGet("geo")]
    public async Task<IActionResult> GetArtistsByLocation(
        [FromQuery] GeoFilterRequest request, CancellationToken cancellationToken)
    {
        if (!IsValidGeoRequest(request))
            return BadRequest(new { message = "Invalid geo params", code = "VALIDATION_ERROR" });

        var result = await _geoService.GetByLocationAsync(request, cancellationToken);
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

    private static bool IsValidGeoRequest(GeoFilterRequest r)
    {
        if (r.Lat is < -90m or > 90m) return false;
        if (r.Lng is < -180m or > 180m) return false;
        if (r.RadiusKm < 0 || r.RadiusKm > 50) return false;
        if (r.MinPrice is < 0 || r.MaxPrice is < 0) return false;
        if (r.MinRating.HasValue && (r.MinRating < 1m || r.MinRating > 5m)) return false;
        if (!string.IsNullOrWhiteSpace(r.Type) && !Enum.TryParse<ArtistType>(r.Type, true, out _)) return false;
        return true;
    }
}
