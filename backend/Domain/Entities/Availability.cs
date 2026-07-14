namespace InkLink.Api.Domain.Entities;

public class Availability
{
    public Guid Id { get; set; }
    public Guid ArtistProfileId { get; set; }
    /// <summary>0=Monday ... 6=Sunday (per data model).</summary>
    public int DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int SlotDurationMinutes { get; set; }
    public bool IsActive { get; set; }

    public ArtistProfile ArtistProfile { get; set; } = null!;
}
