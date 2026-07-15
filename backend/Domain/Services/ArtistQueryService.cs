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

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchPattern = $"%{request.Search}%";
            query = query.Where(artist =>
                EF.Functions.ILike(artist.User.FirstName + " " + artist.User.LastName, searchPattern)
                || EF.Functions.ILike(artist.Commune, searchPattern)
                || EF.Functions.ILike(artist.Bio!, searchPattern)
                || artist.ArtistStyles.Any(s => EF.Functions.ILike(s.Style.Name, searchPattern)));
        }

        query = query.OrderBy(artist => artist.Slug);

        if (request.Available.HasValue)
        {
            var artists = await query
                .Include(artist => artist.User)
                .Include(artist => artist.ArtistStyles).ThenInclude(style => style.Style)
                .Include(artist => artist.PortfolioItems).ThenInclude(item => item.Style)
                .Include(artist => artist.Certifications)
                .Include(artist => artist.Awards)
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
            .Include(artist => artist.Awards)
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
        FeaturedImageUrl: artist.PortfolioItems
            .OrderBy(p => p.SortOrder)
            .Select(p => p.ImageUrl)
            .FirstOrDefault(),
        Bio: artist.Bio is null ? null : (artist.Bio.Length > 100 ? artist.Bio[..100] : artist.Bio),
        Styles: artist.ArtistStyles.Select(style => style.Style.Slug).ToList(),
        ArtistType: artist.ArtistType.ToString().ToLowerInvariant(),
        Commune: artist.Commune,
        Latitude: artist.Latitude,
        Longitude: artist.Longitude,
        MinSessionPrice: artist.MinSessionPrice,
        HourlyRate: artist.HourlyRate,
        IsCertified: artist.Certifications.Any(certification => certification.IsActive),
        HasAwards: artist.Awards.Any(),
        AverageRating: artist.RatingAvg,
        ReviewCount: artist.TotalReviews,
        SponsorBadges: artist.Sponsorships
            .Where(sponsorship => sponsorship.IsActive)
            .Select(sponsorship => new SponsorBadgeDto(sponsorship.BrandName, sponsorship.BrandLogoUrl))
            .ToList());

    public async Task<ArtistProfileDto?> GetArtistBySlugAsync(string slug)
    {
        var artist = await _context.ArtistProfiles
            .Where(a => a.Slug == slug && a.IsPublished)
            .Include(a => a.User)
            .Include(a => a.ArtistStyles).ThenInclude(s => s.Style)
            .Include(a => a.PortfolioItems).ThenInclude(p => p.Style)
            .Include(a => a.Certifications)
            .Include(a => a.Awards)
            .Include(a => a.Sponsorships.Where(s => s.IsActive))
            .Include(a => a.Availabilities.Where(av => av.IsActive))
            .AsSplitQuery()
            .FirstOrDefaultAsync();

        if (artist is null)
            return null;

        return new ArtistProfileDto(
            Id: artist.Id,
            ArtistName: $"{artist.User.FirstName} {artist.User.LastName}",
            Slug: artist.Slug,
            ProfilePhotoUrl: artist.User.AvatarUrl,
            Bio: artist.Bio,
            YearsExperience: artist.YearsExperience,
            ArtistType: artist.ArtistType.ToString().ToLowerInvariant(),
            Commune: artist.Commune,
            Latitude: artist.Latitude,
            Longitude: artist.Longitude,
            Address: artist.Address,
            MinSessionPrice: artist.MinSessionPrice,
            HourlyRate: artist.HourlyRate,
            DepositPercentage: artist.DepositPercentage,
            CancellationPolicy: artist.CancellationPolicy.ToString().ToLowerInvariant(),
            IsCertified: artist.Certifications.Any(c => c.IsActive),
            AverageRating: artist.RatingAvg,
            ReviewCount: artist.TotalReviews,
            Styles: artist.ArtistStyles.Select(s => s.Style.Slug).ToList(),
            PortfolioItems: artist.PortfolioItems
                .OrderBy(p => p.SortOrder)
                .Select(p => new PortfolioItemDto(p.Id, p.ImageUrl, p.ThumbnailUrl, p.Style.Slug, p.IsFeatured, p.SortOrder))
                .ToList(),
            Certifications: artist.Certifications
                .Where(c => c.IsActive)
                .Select(c => new CertificationDto(c.Type.ToString().ToLowerInvariant(), c.Name, c.Issuer, c.ValidUntil, c.IsActive))
                .ToList(),
            Awards: artist.Awards
                .OrderByDescending(a => a.Year)
                .Select(a => new AwardDto(a.Title, a.EventName, a.Year, a.Category, a.BadgeIconUrl))
                .ToList(),
            SponsorBadges: artist.Sponsorships
                .Select(s => new SponsorBadgeDto(s.BrandName, s.BrandLogoUrl))
                .ToList(),
            AvailableSlots: artist.Availabilities
                .Select(a => new AvailableSlotDto(a.DayOfWeek, a.StartTime.ToString("HH:mm"), a.EndTime.ToString("HH:mm"), a.SlotDurationMinutes))
                .ToList());
    }

    public async Task<ReviewListResponse?> GetArtistReviewsAsync(string slug, int page, int pageSize)
    {
        var artist = await _context.ArtistProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Slug == slug && a.IsPublished);

        if (artist is null)
            return null;

        var query = _context.Reviews
            .Where(r => r.ArtistProfileId == artist.Id)
            .AsNoTracking();

        var total = await query.CountAsync();

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(r => r.Client)
            .Select(r => new ReviewDto(
                r.Id,
                r.Client.FirstName,
                r.RatingHygiene,
                r.RatingPainManagement,
                r.RatingCustomerService,
                r.RatingResult,
                Math.Round((r.RatingHygiene + r.RatingPainManagement + r.RatingCustomerService + r.RatingResult) / 4.0m, 2),
                r.Comment,
                r.TattooPhotoUrl,
                r.CreatedAt))
            .ToListAsync();

        return new ReviewListResponse(reviews, total, page, pageSize);
    }

    public async Task<ArtistSuggestionsResponse> GetSuggestionsAsync(string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
        {
            return new ArtistSuggestionsResponse([], []);
        }

        var pattern = $"%{q.Trim()}%";

        var styles = await _context.TattooStyles
            .Where(s => EF.Functions.ILike(s.Name, pattern))
            .OrderBy(s => s.Name)
            .Take(5)
            .Select(s => s.Slug)
            .ToListAsync();

        var communes = await _context.ArtistProfiles
            .Where(a => a.IsPublished && EF.Functions.ILike(a.Commune, pattern))
            .Select(a => a.Commune)
            .Distinct()
            .OrderBy(c => c)
            .Take(5)
            .ToListAsync();

        return new ArtistSuggestionsResponse(styles, communes);
    }
}
