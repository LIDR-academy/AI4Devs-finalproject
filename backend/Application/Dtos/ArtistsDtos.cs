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

public record ArtistListResponse(List<ArtistCardDto> Data, int Total, int Page, int PageSize);

public record ArtistSuggestionsResponse(List<string> Styles, List<string> Communes);
