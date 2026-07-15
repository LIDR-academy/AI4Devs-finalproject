using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Domain.Services;

public class ArtistQueryService
{
    private const int MaxPageSize = 50;

    private readonly InkLinkDbContext _context;

    public ArtistQueryService(InkLinkDbContext context)
    {
        _context = context;
    }

    public async Task<ArtistListResponse> GetArtistsAsync(ArtistFilterRequest request)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = Math.Clamp(request.PageSize, 1, MaxPageSize);

        var query = _context.ArtistProfiles
            .Where(artist => artist.IsPublished)
            .AsNoTracking();

        if (request.Styles is { Length: > 0 })
        {
            var slugs = request.Styles.Select(s => s.Trim().ToLowerInvariant()).ToArray();
            query = query.Where(artist => artist.ArtistStyles.Any(s => slugs.Contains(s.Style.Slug)));
        }

        if (request.MinPrice.HasValue)
        {
            query = query.Where(artist => artist.MinSessionPrice >= request.MinPrice.Value);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(artist => artist.MinSessionPrice <= request.MaxPrice.Value);
        }

        if (request.MinRating.HasValue)
        {
            query = query.Where(artist => artist.RatingAvg >= request.MinRating.Value);
        }

        if (request.Certified.HasValue)
        {
            query = request.Certified.Value
                ? query.Where(artist => artist.Certifications.Any(certification => certification.IsActive))
                : query.Where(artist => artist.Certifications.All(certification => !certification.IsActive));
        }

        if (!string.IsNullOrWhiteSpace(request.Type)
            && Enum.TryParse<ArtistType>(request.Type, true, out var artistType))
        {
            query = query.Where(artist => artist.ArtistType == artistType);
        }

        query = query.OrderBy(artist => artist.Slug);

        if (request.Available.HasValue)
        {
            var artists = await query
                .Include(artist => artist.User)
                .Include(artist => artist.ArtistStyles).ThenInclude(style => style.Style)
                .Include(artist => artist.PortfolioItems).ThenInclude(item => item.Style)
                .Include(artist => artist.Certifications)
                .Include(artist => artist.Sponsorships.Where(sponsorship => sponsorship.IsActive))
                .Include(artist => artist.Availabilities)
                .Include(artist => artist.BlockedDates)
                .AsSplitQuery()
                .ToListAsync();

            var filteredArtists = artists
                .Where(artist => IsAvailableThisWeek(artist) == request.Available.Value)
                .ToList();

            var pagedArtists = filteredArtists
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(ToArtistCard)
                .ToList();

            return new ArtistListResponse(pagedArtists, filteredArtists.Count, page, pageSize);
        }

        var total = await query.CountAsync();
        var data = await query
            .Include(artist => artist.User)
            .Include(artist => artist.ArtistStyles).ThenInclude(style => style.Style)
            .Include(artist => artist.PortfolioItems).ThenInclude(item => item.Style)
            .Include(artist => artist.Certifications)
            .Include(artist => artist.Sponsorships.Where(sponsorship => sponsorship.IsActive))
            .AsSplitQuery()
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new ArtistListResponse(data.Select(ToArtistCard).ToList(), total, page, pageSize);
    }

    private static bool IsAvailableThisWeek(ArtistProfile artist)
    {
        var monday = GetCurrentWeekMonday();

        return artist.Availabilities.Any(availability =>
        {
            if (!availability.IsActive)
            {
                return false;
            }

            var date = monday.AddDays(availability.DayOfWeek);
            return artist.BlockedDates.All(blockedDate => blockedDate.Date != date);
        });
    }

    private static DateOnly GetCurrentWeekMonday()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dayOfWeek = (int)today.DayOfWeek;
        var offset = dayOfWeek == 0 ? -6 : 1 - dayOfWeek;
        return today.AddDays(offset);
    }

    private static ArtistCardDto ToArtistCard(ArtistProfile artist) => new(
        Id: artist.Id,
        ArtistName: $"{artist.User.FirstName} {artist.User.LastName}",
        Slug: artist.Slug,
        ProfilePhotoUrl: artist.User.AvatarUrl,
        Bio: artist.Bio is null ? null : (artist.Bio.Length > 100 ? artist.Bio[..100] : artist.Bio),
        Styles: artist.ArtistStyles.Select(style => style.Style.Slug).ToList(),
        ArtistType: artist.ArtistType.ToString().ToLowerInvariant(),
        Commune: artist.Commune,
        Latitude: artist.Latitude,
        Longitude: artist.Longitude,
        MinSessionPrice: artist.MinSessionPrice,
        HourlyRate: artist.HourlyRate,
        IsCertified: artist.Certifications.Any(certification => certification.IsActive),
        AverageRating: artist.RatingAvg,
        ReviewCount: artist.TotalReviews,
        SponsorBadges: artist.Sponsorships
            .Where(sponsorship => sponsorship.IsActive)
            .Select(sponsorship => new SponsorBadgeDto(sponsorship.BrandName, sponsorship.BrandLogoUrl))
            .ToList());
}
