using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Domain.Services;

public enum QuoteOutcome
{
    Ok,
    ArtistNotFound,
    StyleNotFound,
    InvalidSize
}

public record QuoteResult(QuoteOutcome Outcome, QuoteResponse? Response = null);

/// <summary>Estimated range and deposit for a tattoo (US0011 CA4, CA9 / issue-007).</summary>
public record QuoteEstimate(int PriceMin, int PriceMax, int DepositAmount, List<string> Factors);

/// <summary>
/// US0011 — Deterministic price estimation from the artist's published tariffs.
/// Single source of the pricing formula: used by POST /api/quotes/calculate and by
/// the slot hold (US0008) to derive the booking deposit (CA9, fixs/issue-007.md).
/// </summary>
public class QuoteCalculatorService
{
    private const decimal RangeLowFactor = 0.8m;
    private const decimal RangeHighFactor = 1.3m;

    // Visual size references (api-spec): estimated session hours per size
    private static readonly Dictionary<string, decimal> SizeHours = new(StringComparer.OrdinalIgnoreCase)
    {
        ["coin"] = 1,
        ["palm"] = 2,
        ["hand"] = 4,
        ["arm"] = 6
    };

    // Difficult body zones (+15%): ribs, neck, hands (Spanish and English slugs)
    private static readonly HashSet<string> DifficultZones = new(StringComparer.OrdinalIgnoreCase)
    {
        "costillas", "ribs", "cuello", "neck", "manos", "hands"
    };

    private readonly InkLinkDbContext _context;

    public QuoteCalculatorService(InkLinkDbContext context)
    {
        _context = context;
    }

    public static bool IsValidSizeReference(string? sizeReference) =>
        sizeReference is not null && SizeHours.ContainsKey(sizeReference);

    /// <summary>Pure pricing formula over an already-loaded artist (no I/O).</summary>
    public static QuoteEstimate Estimate(
        ArtistProfile artist, string? bodyZone, string sizeReference, bool isColor, bool isCoverup)
    {
        var hours = SizeHours[sizeReference];
        var baseAmount = Math.Max(artist.MinSessionPrice, artist.HourlyRate * hours);

        var factors = new List<string>();
        var multiplier = 1m;
        if (isCoverup)
        {
            multiplier *= 1.3m;
            factors.Add("Cover-up (+30%)");
        }
        if (isColor)
        {
            multiplier *= 1.2m;
            factors.Add("Color (+20%)");
        }
        if (bodyZone is not null && DifficultZones.Contains(bodyZone.Trim()))
        {
            multiplier *= 1.15m;
            factors.Add("Zona difícil (+15%)");
        }

        var adjusted = baseAmount * multiplier;
        var priceMin = ToClp(adjusted * RangeLowFactor);
        var priceMax = ToClp(adjusted * RangeHighFactor);

        // Deposit floor: the artist's session minimum (issue-007)
        var depositBase = Math.Max(priceMin, artist.MinSessionPrice);
        var depositAmount = depositBase * artist.DepositPercentage / 100;

        return new QuoteEstimate(priceMin, priceMax, depositAmount, factors);
    }

    public async Task<QuoteResult> CalculateAsync(QuoteRequest request, CancellationToken cancellationToken = default)
    {
        if (!IsValidSizeReference(request.SizeReference))
        {
            return new QuoteResult(QuoteOutcome.InvalidSize);
        }

        var styleExists = await _context.TattooStyles
            .AnyAsync(s => s.Id == request.StyleId, cancellationToken);
        if (!styleExists)
        {
            return new QuoteResult(QuoteOutcome.StyleNotFound);
        }

        // General mode: when no artist specified, average across all published artists
        if (request.ArtistProfileId == Guid.Empty)
        {
            return await CalculateGeneralAsync(request, cancellationToken);
        }

        var artist = await _context.ArtistProfiles
            .FirstOrDefaultAsync(a => a.Id == request.ArtistProfileId && a.IsPublished, cancellationToken);
        if (artist is null)
        {
            return new QuoteResult(QuoteOutcome.ArtistNotFound);
        }

        var estimate = Estimate(artist, request.BodyZone, request.SizeReference, request.IsColor, request.IsCoverup);
        return new QuoteResult(QuoteOutcome.Ok, new QuoteResponse(
            estimate.PriceMin, estimate.PriceMax, "CLP", estimate.DepositAmount, estimate.Factors));
    }

    /// <summary>General quote: averages pricing across all published artists.</summary>
    private async Task<QuoteResult> CalculateGeneralAsync(QuoteRequest request, CancellationToken cancellationToken)
    {
        var artists = await _context.ArtistProfiles
            .Where(a => a.IsPublished)
            .ToListAsync(cancellationToken);

        if (artists.Count == 0)
        {
            return new QuoteResult(QuoteOutcome.ArtistNotFound);
        }

        var estimates = artists.Select(a =>
            Estimate(a, request.BodyZone, request.SizeReference, request.IsColor, request.IsCoverup)).ToList();

        var avgMin = (int)estimates.Average(e => e.PriceMin);
        var avgMax = (int)estimates.Average(e => e.PriceMax);
        var avgDeposit = (int)estimates.Average(e => e.DepositAmount);
        var factors = estimates.First().Factors;
        factors.Add($"Promedio de {artists.Count} artistas");

        return new QuoteResult(QuoteOutcome.Ok, new QuoteResponse(
            avgMin, avgMax, "CLP", avgDeposit, factors));
    }

    private static int ToClp(decimal amount) =>
        (int)Math.Round(amount, MidpointRounding.AwayFromZero);
}
