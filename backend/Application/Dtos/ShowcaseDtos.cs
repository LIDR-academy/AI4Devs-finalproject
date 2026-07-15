namespace InkLink.Api.Application.Dtos;

public record SponsorBadgeDto(string BrandName, string? BrandLogoUrl);

public record ArtistCardDto(
    Guid Id,
    string ArtistName,
    string Slug,
    string? ProfilePhotoUrl,
    string? FeaturedImageUrl,
    string? Bio,
    List<string> Styles,
    string ArtistType,
    string Commune,
    decimal Latitude,
    decimal Longitude,
    int MinSessionPrice,
    int HourlyRate,
    bool IsCertified,
    bool HasAwards,
    decimal AverageRating,
    int ReviewCount,
    List<SponsorBadgeDto> SponsorBadges
);

public record ShowcaseItem(string ImageUrl, string? ThumbnailUrl, string Style, ArtistCardDto Artist);

public record ShowcaseSection(string Key, string Title, List<ShowcaseItem> Items);

public record ShowcaseResponse(List<ShowcaseSection> Sections);
