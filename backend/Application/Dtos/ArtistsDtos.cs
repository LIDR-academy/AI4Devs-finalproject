namespace InkLink.Api.Application.Dtos;

public record ArtistFilterRequest
{
    public string[]? Styles { get; init; }
    public int? MinPrice { get; init; }
    public int? MaxPrice { get; init; }
    public decimal? MinRating { get; init; }
    public bool? Certified { get; init; }
    public bool? Available { get; init; }
    public string? Type { get; init; }
    public string? Search { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 12;
}

// US0012 — Geo search request
public record GeoFilterRequest
{
    public decimal Lat { get; init; }
    public decimal Lng { get; init; }
    /// <summary>Search radius in kilometres (1–50). 0 = entire city (no radius limit, max 100).</summary>
    public decimal RadiusKm { get; init; } = 10;
    // Optional US0004 filters
    public string[]? Styles { get; init; }
    public int? MinPrice { get; init; }
    public int? MaxPrice { get; init; }
    public decimal? MinRating { get; init; }
    public bool? Certified { get; init; }
    public string? Type { get; init; }
}

public record ArtistListResponse(List<ArtistCardDto> Data, int Total, int Page, int PageSize);

public record ArtistSuggestionsResponse(List<string> Styles, List<string> Communes);

// --- Artist Profile DTOs ---

public record PortfolioItemDto(Guid Id, string ImageUrl, string? ThumbnailUrl, string StyleSlug, bool IsFeatured, int SortOrder);

public record CertificationDto(string Type, string Name, string Issuer, DateOnly ValidUntil, bool IsActive);

public record AwardDto(string Title, string EventName, int Year, string? Category, string? BadgeIconUrl);

public record AvailableSlotDto(int DayOfWeek, string StartTime, string EndTime, int SlotDurationMinutes);

public record ArtistProfileDto(
    Guid Id, string ArtistName, string Slug, string? ProfilePhotoUrl,
    string? Bio, int YearsExperience, string ArtistType, string Commune,
    decimal Latitude, decimal Longitude, string? Address,
    int MinSessionPrice, int HourlyRate, int DepositPercentage, string CancellationPolicy,
    bool IsCertified, decimal AverageRating, int ReviewCount,
    List<string> Styles, List<PortfolioItemDto> PortfolioItems,
    List<CertificationDto> Certifications, List<AwardDto> Awards,
    List<SponsorshipDto> Sponsorships, List<AvailableSlotDto> AvailableSlots);

public record SponsorshipDto(Guid Id, string BrandName, string? BrandLogoUrl, string RelationshipType);

public record ReviewDto(Guid Id, string ClientName, int RatingHygiene, int RatingPainManagement,
    int RatingCustomerService, int RatingResult, decimal AverageRating,
    string? Comment, string? TattooPhotoUrl, DateTime CreatedAt);

public record ReviewListResponse(List<ReviewDto> Data, int Total, int Page, int PageSize);
