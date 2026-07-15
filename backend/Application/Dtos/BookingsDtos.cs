namespace InkLink.Api.Application.Dtos;

// US0008 — Weekly availability (GET /api/artists/{id}/availability)

public record BookableSlotDto(DateOnly Date, string StartTime, string EndTime, bool IsAvailable);

public record WeekAvailabilityResponse(DateOnly WeekStart, List<BookableSlotDto> Slots);

// US0008 — Slot hold (POST /api/bookings/hold)

public record BookingHoldRequest(
    Guid ArtistProfileId,
    DateOnly BookingDate,
    string StartTime,
    string EndTime,
    string? BodyZone = null,
    string? SizeReference = null,
    Guid? StyleId = null,
    bool IsColor = false,
    bool IsCoverup = false,
    List<string>? ReferenceImageUrls = null,
    string? Notes = null);

public record ArtistSummaryDto(
    Guid ArtistProfileId,
    string ArtistName,
    string Slug,
    string? ProfilePhotoUrl);

// US0009 — Deposit payment via Flow

public record PaymentCreateRequest(Guid BookingId);

public record PaymentCreateResponse(string PaymentUrl, string Token);

public record BookingDto(
    Guid Id,
    Guid ClientId,
    ArtistSummaryDto Artist,
    string Status,
    DateOnly BookingDate,
    string StartTime,
    string EndTime,
    int EstimatedPriceMin,
    int EstimatedPriceMax,
    int DepositAmount,
    string? BodyZone,
    string? SizeReference,
    Guid? StyleId,
    string? StyleName,
    bool IsColor,
    bool IsCoverup,
    List<string> ReferenceImageUrls,
    string? Notes,
    bool HasReview,
    DateTime CreatedAt,
    DateTime? ExpiresAt);
