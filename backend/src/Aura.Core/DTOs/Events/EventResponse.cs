using Aura.Core.Enums;

namespace Aura.Core.DTOs.Events;

public class EventResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public Guid? TemplateId { get; set; }
    public string PrimaryColor { get; set; } = null!;
    public string SecondaryColor { get; set; } = null!;
    public string FontFamily { get; set; } = null!;
    public string? HeroImageUrl { get; set; }
    public string CoupleNames { get; set; } = null!;
    public DateTimeOffset EventDate { get; set; }
    public DateTimeOffset EventEndDate { get; set; }
    public string VenueName { get; set; } = null!;
    public string VenueAddress { get; set; } = null!;
    public decimal? VenueLat { get; set; }
    public decimal? VenueLng { get; set; }
    public EventStatus Status { get; set; }
    public int GuestCount { get; set; }
    public int PendingRsvps { get; set; }
    public int ConfirmedRsvps { get; set; }
    public int DeclinedRsvps { get; set; }
}
