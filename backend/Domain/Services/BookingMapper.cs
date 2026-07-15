using InkLink.Api.Application.Dtos;
using InkLink.Api.Domain.Entities;
using InkLink.Api.Domain.Enums;

namespace InkLink.Api.Domain.Services;

/// <summary>Shared Booking → BookingDto mapping (US0008 hold, US0009 detail, US0010 history).</summary>
public static class BookingMapper
{
    public static BookingDto ToDto(Booking booking, ArtistProfile artist, string? styleName) => new(
        booking.Id,
        booking.ClientId,
        new ArtistSummaryDto(
            artist.Id,
            $"{artist.User.FirstName} {artist.User.LastName}",
            artist.Slug,
            artist.User.AvatarUrl),
        ToStatusString(booking.Status),
        booking.BookingDate,
        booking.StartTime.ToString("HH:mm"),
        booking.EndTime.ToString("HH:mm"),
        booking.EstimatedPriceMin,
        booking.EstimatedPriceMax,
        booking.DepositAmount,
        booking.BodyZone,
        booking.SizeReference,
        booking.StyleId,
        styleName,
        booking.IsColor,
        booking.IsCoverup,
        booking.ReferenceImages,
        booking.Notes,
        HasReview: booking.Review is not null,
        booking.CreatedAt,
        booking.ExpiresAt);

    public static string ToStatusString(BookingStatus status) => status switch
    {
        BookingStatus.PendingPayment => "pending_payment",
        BookingStatus.Confirmed => "confirmed",
        BookingStatus.Completed => "completed",
        _ => "cancelled"
    };
}
