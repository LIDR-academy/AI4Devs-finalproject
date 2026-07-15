using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;
using InkLink.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Domain.Services;

public enum ReviewOutcome
{
    Created,
    BookingNotFound,
    NotOwner,
    NotCompleted,
    AlreadyReviewed,
    Invalid
}

public record ReviewResult(ReviewOutcome Outcome, ReviewDto? Review = null, string? Error = null);

/// <summary>
/// US0013 — 4-dimension immutable reviews. One per booking (unique index on reviews.booking_id);
/// the artist's rating_avg/total_reviews are recalculated atomically in SQL after each insert.
/// </summary>
public class ReviewService
{
    private readonly InkLinkDbContext _context;

    public ReviewService(InkLinkDbContext context)
    {
        _context = context;
    }

    public async Task<ReviewResult> CreateAsync(
        Guid clientId, Guid bookingId, ReviewRequest request, CancellationToken cancellationToken = default)
    {
        var validationError = Validate(request);
        if (validationError is not null)
        {
            return new ReviewResult(ReviewOutcome.Invalid, Error: validationError);
        }

        var booking = await _context.Bookings
            .Include(b => b.Client)
            .Include(b => b.Review)
            .SingleOrDefaultAsync(b => b.Id == bookingId, cancellationToken);
        if (booking is null)
        {
            return new ReviewResult(ReviewOutcome.BookingNotFound);
        }
        if (booking.ClientId != clientId)
        {
            return new ReviewResult(ReviewOutcome.NotOwner);
        }
        if (booking.Status != BookingStatus.Completed)
        {
            return new ReviewResult(ReviewOutcome.NotCompleted);
        }
        if (booking.Review is not null)
        {
            return new ReviewResult(ReviewOutcome.AlreadyReviewed);
        }

        var review = new Review
        {
            Id = Guid.NewGuid(),
            BookingId = booking.Id,
            ClientId = clientId,
            ArtistProfileId = booking.ArtistProfileId,
            RatingHygiene = request.RatingHygiene,
            RatingPainManagement = request.RatingPainManagement,
            RatingCustomerService = request.RatingCustomerService,
            RatingResult = request.RatingResult,
            Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim(),
            TattooPhotoUrl = request.TattooPhotoUrl,
            CreatedAt = DateTime.UtcNow
        };
        _context.Reviews.Add(review);

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // Unique index on booking_id: concurrent duplicate submission
            await transaction.RollbackAsync(cancellationToken);
            return new ReviewResult(ReviewOutcome.AlreadyReviewed);
        }

        // CA6 — atomic recalculation from all persisted reviews (no read-modify-write race)
        await _context.Database.ExecuteSqlAsync($"""
            UPDATE artist_profiles SET
                rating_avg = COALESCE((
                    SELECT ROUND(AVG((rating_hygiene + rating_pain_management + rating_customer_service + rating_result) / 4.0), 2)
                    FROM reviews WHERE artist_profile_id = {booking.ArtistProfileId}), 0),
                total_reviews = (
                    SELECT COUNT(*) FROM reviews WHERE artist_profile_id = {booking.ArtistProfileId})
            WHERE id = {booking.ArtistProfileId}
            """, cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var averageRating = Math.Round(
            (request.RatingHygiene + request.RatingPainManagement +
             request.RatingCustomerService + request.RatingResult) / 4.0m, 2);
        return new ReviewResult(ReviewOutcome.Created, new ReviewDto(
            review.Id,
            $"{booking.Client.FirstName} {booking.Client.LastName}",
            review.RatingHygiene,
            review.RatingPainManagement,
            review.RatingCustomerService,
            review.RatingResult,
            averageRating,
            review.Comment,
            review.TattooPhotoUrl,
            review.CreatedAt));
    }

    private static string? Validate(ReviewRequest request)
    {
        var ratings = new[]
        {
            request.RatingHygiene, request.RatingPainManagement,
            request.RatingCustomerService, request.RatingResult
        };
        if (ratings.Any(r => r is < 1 or > 5))
        {
            return "All ratings must be between 1 and 5";
        }
        if (request.Comment is { Length: > 2000 })
        {
            return "Comment must be at most 2000 characters";
        }
        return null;
    }
}
