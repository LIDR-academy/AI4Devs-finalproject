using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace InkLink.Api.Domain.Services;

/// <summary>
/// US0012 — Geo-spatial artist search using PostGIS ST_DWithin.
/// Returns up to 100 published artists within the requested radius,
/// ordered by distance, with optional US0004 filters applied.
/// </summary>
public class GeoService
{
    private const int MaxResults = 100;
    private const double MaxRadiusKm = 50.0;

    private readonly InkLinkDbContext _context;

    public GeoService(InkLinkDbContext context)
    {
        _context = context;
    }

    public async Task<ArtistListResponse> GetByLocationAsync(
        GeoFilterRequest request, CancellationToken cancellationToken = default)
    {
        var radiusMeters = request.RadiusKm <= 0
            ? MaxRadiusKm * 1000
            : Math.Min((double)request.RadiusKm, MaxRadiusKm) * 1000;

        var orderedIds = await GetOrderedIdsByDistanceAsync(
            (double)request.Lat, (double)request.Lng, radiusMeters, cancellationToken);

        if (orderedIds.Count == 0)
            return new ArtistListResponse([], 0, 1, MaxResults);

        var query = _context.ArtistProfiles
            .Where(a => orderedIds.Contains(a.Id))
            .AsNoTracking();

        if (request.Styles is { Length: > 0 })
        {
            var slugs = request.Styles.Select(s => s.Trim().ToLowerInvariant()).ToArray();
            query = query.Where(a => a.ArtistStyles.Any(s => slugs.Contains(s.Style.Slug)));
        }
        if (request.MinPrice.HasValue)
            query = query.Where(a => a.MinSessionPrice >= request.MinPrice.Value);
        if (request.MaxPrice.HasValue)
            query = query.Where(a => a.MinSessionPrice <= request.MaxPrice.Value);
        if (request.MinRating.HasValue)
            query = query.Where(a => a.RatingAvg >= request.MinRating.Value);
        if (request.Certified.HasValue)
            query = request.Certified.Value
                ? query.Where(a => a.Certifications.Any(c => c.IsActive))
                : query.Where(a => a.Certifications.All(c => !c.IsActive));
        if (!string.IsNullOrWhiteSpace(request.Type)
            && Enum.TryParse<ArtistType>(request.Type, true, out var artistType))
            query = query.Where(a => a.ArtistType == artistType);

        var artists = await query
            .Include(a => a.User)
            .Include(a => a.ArtistStyles).ThenInclude(s => s.Style)
            .Include(a => a.PortfolioItems).ThenInclude(p => p.Style)
            .Include(a => a.Certifications)
            .Include(a => a.Awards)
            .Include(a => a.Sponsorships.Where(s => s.IsActive))
            .AsSplitQuery()
            .ToListAsync(cancellationToken);

        var artistMap = artists.ToDictionary(a => a.Id);
        var ordered = orderedIds
            .Where(id => artistMap.ContainsKey(id))
            .Select(id => ToArtistCard(artistMap[id]))
            .ToList();

        return new ArtistListResponse(ordered, ordered.Count, 1, MaxResults);
    }

    private async Task<List<Guid>> GetOrderedIdsByDistanceAsync(
        double lat, double lng, double radiusMeters, CancellationToken ct)
    {
        var conn = (NpgsqlConnection)_context.Database.GetDbConnection();
        var wasOpen = conn.State == System.Data.ConnectionState.Open;
        if (!wasOpen) await conn.OpenAsync(ct);

        try
        {
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = """
                SELECT id
                FROM artist_profiles
                WHERE is_published = true
                  AND ST_DWithin(
                      geography(ST_MakePoint(@lng, @lat)),
                      geography(ST_MakePoint(longitude, latitude)),
                      @radius
                  )
                ORDER BY ST_Distance(
                    geography(ST_MakePoint(@lng, @lat)),
                    geography(ST_MakePoint(longitude, latitude))
                )
                LIMIT @limit
                """;
            cmd.Parameters.AddWithValue("lat", lat);
            cmd.Parameters.AddWithValue("lng", lng);
            cmd.Parameters.AddWithValue("radius", radiusMeters);
            cmd.Parameters.AddWithValue("limit", MaxResults);

            var ids = new List<Guid>();
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
                ids.Add(reader.GetGuid(0));
            return ids;
        }
        finally
        {
            if (!wasOpen) await conn.CloseAsync();
        }
    }

    private static ArtistCardDto ToArtistCard(ArtistProfile artist) => new(
        Id: artist.Id,
        ArtistName: $"{artist.User.FirstName} {artist.User.LastName}",
        Slug: artist.Slug,
        ProfilePhotoUrl: artist.User.AvatarUrl,
        FeaturedImageUrl: artist.PortfolioItems
            .OrderBy(p => p.SortOrder).Select(p => p.ImageUrl).FirstOrDefault(),
        Bio: artist.Bio is null ? null : (artist.Bio.Length > 100 ? artist.Bio[..100] : artist.Bio),
        Styles: artist.ArtistStyles.Select(s => s.Style.Slug).ToList(),
        ArtistType: artist.ArtistType.ToString().ToLowerInvariant(),
        Commune: artist.Commune,
        Latitude: artist.Latitude,
        Longitude: artist.Longitude,
        MinSessionPrice: artist.MinSessionPrice,
        HourlyRate: artist.HourlyRate,
        IsCertified: artist.Certifications.Any(c => c.IsActive),
        HasAwards: artist.Awards.Any(),
        AverageRating: artist.RatingAvg,
        ReviewCount: artist.TotalReviews,
        SponsorBadges: artist.Sponsorships
            .Where(s => s.IsActive)
            .Select(s => new SponsorBadgeDto(s.BrandName, s.BrandLogoUrl))
            .ToList());
}
