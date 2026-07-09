namespace Aura.Core.DTOs.Events;

public class CreateEventRequest
{
    public string Name { get; set; } = null!;
    public Guid? TemplateId { get; set; }
    public string PrimaryColor { get; set; } = "#4F46E5";
    public string SecondaryColor { get; set; } = "#7C3AED";
    public string FontFamily { get; set; } = "Inter";
    public string CoupleNames { get; set; } = null!;
    public DateTimeOffset EventDate { get; set; }
    public DateTimeOffset? EventEndDate { get; set; }
    public string VenueName { get; set; } = null!;
    public string VenueAddress { get; set; } = null!;
}
