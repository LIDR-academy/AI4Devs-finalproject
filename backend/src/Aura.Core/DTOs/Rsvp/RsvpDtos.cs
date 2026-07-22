using Aura.Core.Enums;

namespace Aura.Core.DTOs.Rsvp;

public record RsvpInfoResponse(
    string GuestName,
    string EventName,
    string CoupleNames,
    DateTimeOffset EventDate,
    string VenueName,
    string VenueAddress,
    ExistingRsvpDto? ExistingRsvp,
    bool DeadlinePassed
);

public record ExistingRsvpDto(
    RsvpAttendance Attendance,
    string? DietaryRestrictions,
    bool NeedsTransport,
    bool BringingPlusOne,
    string? PlusOneName,
    string? PersonalMessage
);

public record SubmitRsvpRequest(
    RsvpAttendance Attendance,
    string? DietaryRestrictions,
    bool NeedsTransport,
    bool BringingPlusOne,
    string? PlusOneName,
    string? PersonalMessage
);

public record RsvpConfirmationResponse(
    Guid ConfirmationId,
    string GuestName,
    RsvpAttendance Attendance,
    string EventName
);
