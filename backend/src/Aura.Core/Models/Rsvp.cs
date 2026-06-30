using Aura.Core.Enums;

namespace Aura.Core.Models;

public class Rsvp
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InvitationId { get; set; }
    public Guid GuestId { get; set; }
    public Guid EventId { get; set; }
    public RsvpAttendance Attendance { get; set; }
    public string? DietaryRestrictions { get; set; }
    public bool NeedsTransport { get; set; }
    public bool PlusOne { get; set; }
    public string? Message { get; set; }
    public DateTimeOffset SubmittedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Invitation Invitation { get; set; } = null!;
    public Guest Guest { get; set; } = null!;
    public Event Event { get; set; } = null!;
}
