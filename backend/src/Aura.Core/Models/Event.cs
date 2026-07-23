using Aura.Core.Enums;

namespace Aura.Core.Models;

public class Event
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public Guid? TemplateId { get; set; }
    public string PrimaryColor { get; set; } = "#4F46E5";
    public string SecondaryColor { get; set; } = "#7C3AED";
    public string FontFamily { get; set; } = "Inter";
    public string? HeroImageUrl { get; set; }
    public string CoupleNames { get; set; } = null!;
    public DateTimeOffset EventDate { get; set; }
    public string VenueName { get; set; } = null!;
    public string VenueAddress { get; set; } = null!;
    public decimal? VenueLat { get; set; }
    public decimal? VenueLng { get; set; }
    public EventStatus Status { get; set; } = EventStatus.Draft;
    public DateTimeOffset? PublishedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset EventEndDate { get; set; }
    
    public string? ThankYouMessage { get; set; }
    public string? PhotoGalleryUrl { get; set; }

    public User User { get; set; } = null!;
    public Template? Template { get; set; }
    public ICollection<Guest> Guests { get; set; } = new List<Guest>();
    public ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();
    public ICollection<Accomplice> Accomplices { get; set; } = new List<Accomplice>();
    public ICollection<MessageTemplate> MessageTemplates { get; set; } = new List<MessageTemplate>();
    public ICollection<LiveMessage> LiveMessages { get; set; } = new List<LiveMessage>();
    public ICollection<DeliveryLog> DeliveryLogs { get; set; } = new List<DeliveryLog>();
    public Payment? Payment { get; set; }
    public DataRetentionJob? DataRetentionJob { get; set; }
}
