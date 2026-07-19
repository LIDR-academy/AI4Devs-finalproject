using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Domain.Services;

public class ShowcaseService
{
    private readonly InkLinkDbContext _context;

    public ShowcaseService(InkLinkDbContext context)
    {
        _context = context;
    }

    public async Task<ShowcaseResponse> GetShowcaseAsync(double? lat, double? lng, int limitPerSection = 8)
    {
        var artists = await _context.ArtistProfiles
            .Where(a => a.IsPublished)
            .Include(a => a.User)
            .Include(a => a.ArtistStyles).ThenInclude(s => s.Style)
            .Include(a => a.PortfolioItems).ThenInclude(p => p.Style)
            .Include(a => a.Certifications)
            .Include(a => a.Awards)
            .Include(a => a.Sponsorships.Where(s => s.IsActive))
            .AsSplitQuery()
            .ToListAsync();

        var sections = new List<ShowcaseSection>
        {
            BuildNearYouSection(artists, lat, lng, limitPerSection),
            BuildTopRatedSection(artists, limitPerSection),
            BuildPopularStylesSection(artists, 12),
            BuildAwardedArtistsSection(artists, limitPerSection),
        };

        return new ShowcaseResponse(sections);
    }

    private static ShowcaseSection BuildNearYouSection(
        IEnumerable<ArtistProfile> artists, double? lat, double? lng, int limit)
    {
        IEnumerable<ArtistProfile> ordered = (lat.HasValue && lng.HasValue)
            ? artists.OrderBy(a => HaversineDistance((double)a.Latitude, (double)a.Longitude, lat.Value, lng.Value))
            : artists.OrderByDescending(a => a.RatingAvg);

        var items = ordered.Take(limit).Select(ToShowcaseItem).ToList();
        return new ShowcaseSection("near_you", "Cerca de ti", items);
    }

    private static ShowcaseSection BuildTopRatedSection(IEnumerable<ArtistProfile> artists, int limit)
    {
        var items = artists
            .OrderByDescending(a => a.RatingAvg)
            .Take(limit)
            .Select(ToShowcaseItem)
            .ToList();
        return new ShowcaseSection("top_rated", "Mejor calificados", items);
    }

    private static ShowcaseSection BuildPopularStylesSection(IEnumerable<ArtistProfile> artists, int limit)
    {
        // One representative item per style, ordered by how many artists use that style
        var artistList = artists.ToList();
        var items = artistList
            .SelectMany(a => a.ArtistStyles.Select(s => new { Artist = a, Style = s.Style }))
            .GroupBy(x => x.Style.Id)
            .OrderByDescending(g => g.Count())
            .Take(limit)
            .Select(g =>
            {
                var bestArtist = g.OrderByDescending(x => x.Artist.RatingAvg).First();
                var portfolio = bestArtist.Artist.PortfolioItems
                    .Where(p => p.StyleId == g.Key)
                    .OrderByDescending(p => p.IsFeatured)
                    .ThenBy(p => p.SortOrder)
                    .FirstOrDefault();
                if (portfolio is null) return null;
                return new ShowcaseItem(
                    ImageUrl: portfolio.ThumbnailUrl ?? portfolio.ImageUrl,
                    ThumbnailUrl: portfolio.ThumbnailUrl,
                    Style: bestArtist.Style.Slug,
                    Artist: ToArtistCard(bestArtist.Artist));
            })
            .Where(i => i is not null)
            .Cast<ShowcaseItem>()
            .ToList();

        return new ShowcaseSection("popular_styles", "Estilos populares", items);
    }

    private static ShowcaseSection BuildAwardedArtistsSection(IEnumerable<ArtistProfile> artists, int limit)
    {
        var items = artists
            .Where(a => a.Awards.Count != 0)
            .OrderByDescending(a => a.RatingAvg)
            .Take(limit)
            .Select(ToShowcaseItem)
            .ToList();
        return new ShowcaseSection("awarded_artists", "Artistas premiados", items);
    }

    private static ShowcaseItem ToShowcaseItem(ArtistProfile artist)
    {
        var portfolio = artist.PortfolioItems
            .OrderByDescending(p => p.IsFeatured)
            .ThenBy(p => p.SortOrder)
            .FirstOrDefault();

        return new ShowcaseItem(
            ImageUrl: portfolio?.ThumbnailUrl ?? portfolio?.ImageUrl ?? "",
            ThumbnailUrl: portfolio?.ThumbnailUrl,
            Style: portfolio?.Style?.Slug ?? "",
            Artist: ToArtistCard(artist));
    }

    private static ShowcaseItem? ToShowcaseItemForStyle(ArtistProfile artist, Guid styleId)
    {
        var portfolio = artist.PortfolioItems
            .Where(p => p.StyleId == styleId)
            .OrderByDescending(p => p.IsFeatured)
            .ThenBy(p => p.SortOrder)
            .FirstOrDefault();

        if (portfolio is null) return null;

        return new ShowcaseItem(
            ImageUrl: portfolio.ThumbnailUrl ?? portfolio.ImageUrl,
            ThumbnailUrl: portfolio.ThumbnailUrl,
            Style: portfolio.Style?.Slug ?? "",
            Artist: ToArtistCard(artist));
    }

    private static ArtistCardDto ToArtistCard(ArtistProfile artist) => new(
        Id: artist.Id,
        ArtistName: $"{artist.User.FirstName} {artist.User.LastName}",
        Slug: artist.Slug,
        ProfilePhotoUrl: artist.User.AvatarUrl,
        FeaturedImageUrl: artist.PortfolioItems
            .OrderBy(p => p.SortOrder)
            .Select(p => p.ImageUrl)
            .FirstOrDefault(),
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
            .ToList()
    );

    /// <summary>Haversine great-circle distance in meters.</summary>
    private static double HaversineDistance(double lat1, double lng1, double lat2, double lng2)
    {
        const double R = 6371000; // Earth radius in meters
        var dLat = ToRad(lat2 - lat1);
        var dLng = ToRad(lng2 - lng1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
              * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double degrees) => degrees * Math.PI / 180;
}
