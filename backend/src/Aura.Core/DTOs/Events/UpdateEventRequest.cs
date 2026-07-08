using Aura.Core.Enums;

namespace Aura.Core.DTOs.Events;

public class UpdateEventRequest
{
    public string Name { get; set; } = null!;
    public Guid? TemplateId { get; set; }
    public string PrimaryColor { get; set; } = null!;
    public string SecondaryColor { get; set; } = null!;
    public string FontFamily { get; set; } = null!;
    public string? HeroImageUrl { get; set; }
    public string CoupleNames { get; set; } = null!;
    public DateTimeOffset EventDate { get; set; }
    public DateTimeOffset? EventEndDate { get; set; }
    public string VenueName { get; set; } = null!;
    public string VenueAddress { get; set; } = null!;
    public EventStatus? Status { get; set; }
}
