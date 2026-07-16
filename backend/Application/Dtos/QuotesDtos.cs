namespace InkLink.Api.Application.Dtos;

// US0011 — Chatbot price estimation (POST /api/quotes/calculate)

public record QuoteRequest(
    Guid ArtistProfileId,
    string BodyZone,
    string SizeReference,
    Guid StyleId,
    bool IsColor = false,
    bool IsCoverup = false);

public record QuoteResponse(
    int PriceMin,
    int PriceMax,
    string Currency,
    int DepositAmount,
    List<string> Factors);

// Public style catalog (GET /api/styles) — used by the chatbot to resolve style ids
public record TattooStyleDto(Guid Id, string Name, string Slug);
