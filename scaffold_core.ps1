$corePath = "c:\repos\AI4Devs-finalproject\backend\src\Aura.Core"
$interfacesPath = "$corePath\Interfaces"
$enumsPath = "$corePath\Enums"
$modelsPath = "$corePath\Models"
$repoInterfacesPath = "$interfacesPath\Repositories"

New-Item -ItemType Directory -Force -Path $interfacesPath | Out-Null
New-Item -ItemType Directory -Force -Path $enumsPath | Out-Null
New-Item -ItemType Directory -Force -Path $modelsPath | Out-Null
New-Item -ItemType Directory -Force -Path $repoInterfacesPath | Out-Null
Remove-Item -Path "$corePath\Class1.cs" -ErrorAction SilentlyContinue

$softDeletable = @"
namespace Aura.Core.Interfaces;

public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTimeOffset? DeletedAt { get; set; }
}
"@
Set-Content -Path "$interfacesPath\ISoftDeletable.cs" -Value $softDeletable

$enums = @"
namespace Aura.Core.Enums;

public enum UserStatus { Pending, Active, Suspended, Anonymized }
public enum ConsentType { Terms, Marketing, DataProcessing }
public enum EventStatus { Draft, Published, Completed, Archived }
public enum GuestCategory { Family, Friends, Colleagues, Other }
public enum DeliveryStatus { Pending, Queued, Sent, Delivered, Opened, Failed, Bounced }
public enum Channel { Email, WhatsApp, Both }
public enum RsvpAttendance { Yes, No, Maybe }
public enum PaymentStatus { Pending, Succeeded, Failed, Refunded }
public enum PaymentTier { Standard, Premium }
public enum JobStatus { Scheduled, Running, Completed, Failed }
public enum DeliveryEntityType { Invitation, LiveMessage, Reminder, ThankYou, MagicLink }
"@
Set-Content -Path "$enumsPath\Enums.cs" -Value $enums

# Let's write the Models.
$userCs = @"
using Aura.Core.Enums;

namespace Aura.Core.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? HashedMagicLinkToken { get; set; }
    public DateTimeOffset? TokenExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastLoginAt { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Pending;
    public string Timezone { get; set; } = "Europe/Madrid";
    public string Locale { get; set; } = "es-ES";
    public bool IsAnonymized { get; set; }
    public DateTimeOffset? AnonymizedAt { get; set; }

    public ICollection<UserConsent> Consents { get; set; } = new List<UserConsent>();
    public ICollection<Event> Events { get; set; } = new List<Event>();
}
"@
Set-Content -Path "$modelsPath\User.cs" -Value $userCs

$userConsentCs = @"
using Aura.Core.Enums;

namespace Aura.Core.Models;

public class UserConsent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public ConsentType ConsentType { get; set; }
    public string TermsVersion { get; set; } = null!;
    public bool IsAccepted { get; set; }
    public DateTimeOffset AcceptedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? WithdrawnAt { get; set; }

    public User User { get; set; } = null!;
}
"@
Set-Content -Path "$modelsPath\UserConsent.cs" -Value $userConsentCs

$eventCs = @"
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
"@
Set-Content -Path "$modelsPath\Event.cs" -Value $eventCs

$templateCs = @"
namespace Aura.Core.Models;

public class Template
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string PreviewUrl { get; set; } = null!;
    public string Category { get; set; } = "wedding";
    public bool IsPremium { get; set; }
    public string LayoutJson { get; set; } = "{}";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Event> Events { get; set; } = new List<Event>();
}
"@
Set-Content -Path "$modelsPath\Template.cs" -Value $templateCs

$guestCs = @"
using Aura.Core.Enums;
using Aura.Core.Interfaces;

namespace Aura.Core.Models;

public class Guest : ISoftDeletable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public GuestCategory Category { get; set; } = GuestCategory.Other;
    public DeliveryStatus InviteStatus { get; set; } = DeliveryStatus.Pending;
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public bool IsAnonymized { get; set; }
    public DateTimeOffset? AnonymizedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Event Event { get; set; } = null!;
    public ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();
}
"@
Set-Content -Path "$modelsPath\Guest.cs" -Value $guestCs

$invitationCs = @"
using Aura.Core.Enums;
using Aura.Core.Interfaces;

namespace Aura.Core.Models;

public class Invitation : ISoftDeletable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GuestId { get; set; }
    public Guid EventId { get; set; }
    public string TokenHash { get; set; } = null!;
    public Channel? SentVia { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public DeliveryStatus DeliveryStatus { get; set; } = DeliveryStatus.Pending;
    public int RetryCount { get; set; }
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Guest Guest { get; set; } = null!;
    public Event Event { get; set; } = null!;
    public Rsvp? Rsvp { get; set; }
}
"@
Set-Content -Path "$modelsPath\Invitation.cs" -Value $invitationCs

$rsvpCs = @"
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
"@
Set-Content -Path "$modelsPath\Rsvp.cs" -Value $rsvpCs

$accompliceCs = @"
namespace Aura.Core.Models;

public class Accomplice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public string Email { get; set; } = null!;
    public string TokenHash { get; set; } = null!;
    public string Permissions { get; set; } = "[\"send_messages\",\"view_rsvps\"]";
    public DateTimeOffset GrantedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? LastAccessedAt { get; set; }
    public bool IsRevoked { get; set; }
    public bool IsAnonymized { get; set; }
    public DateTimeOffset? AnonymizedAt { get; set; }

    public Event Event { get; set; } = null!;
    public ICollection<LiveMessage> LiveMessages { get; set; } = new List<LiveMessage>();
}
"@
Set-Content -Path "$modelsPath\Accomplice.cs" -Value $accompliceCs

$messageTemplateCs = @"
using Aura.Core.Interfaces;

namespace Aura.Core.Models;

public class MessageTemplate : ISoftDeletable
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public string Label { get; set; } = null!;
    public string DefaultMessage { get; set; } = null!;
    public string Icon { get; set; } = null!;
    public bool RequiresSwipe { get; set; } = true;
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Event Event { get; set; } = null!;
    public ICollection<LiveMessage> LiveMessages { get; set; } = new List<LiveMessage>();
}
"@
Set-Content -Path "$modelsPath\MessageTemplate.cs" -Value $messageTemplateCs

$liveMessageCs = @"
using Aura.Core.Enums;

namespace Aura.Core.Models;

public class LiveMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public Guid AccompliceId { get; set; }
    public Guid MessageTemplateId { get; set; }
    public string? CustomMessage { get; set; }
    public Channel SentVia { get; set; } = Channel.WhatsApp;
    public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;
    public DeliveryStatus DeliveryStatus { get; set; } = DeliveryStatus.Pending;
    public int RetryCount { get; set; }

    public Event Event { get; set; } = null!;
    public Accomplice Accomplice { get; set; } = null!;
    public MessageTemplate MessageTemplate { get; set; } = null!;
}
"@
Set-Content -Path "$modelsPath\LiveMessage.cs" -Value $liveMessageCs

$paymentCs = @"
using Aura.Core.Enums;

namespace Aura.Core.Models;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public string? StripePaymentIntentId { get; set; }
    public string? StripeCustomerId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public PaymentTier Tier { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; set; }

    public Event Event { get; set; } = null!;
}
"@
Set-Content -Path "$modelsPath\Payment.cs" -Value $paymentCs

$dataRetentionJobCs = @"
using Aura.Core.Enums;

namespace Aura.Core.Models;

public class DataRetentionJob
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public DateTimeOffset ScheduledDeleteAt { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Scheduled;
    public DateTimeOffset? ExecutedAt { get; set; }
    public string? FailureReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Event Event { get; set; } = null!;
}
"@
Set-Content -Path "$modelsPath\DataRetentionJob.cs" -Value $dataRetentionJobCs

$deliveryLogCs = @"
using Aura.Core.Enums;

namespace Aura.Core.Models;

public class DeliveryLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EventId { get; set; }
    public DeliveryEntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public Channel Channel { get; set; }
    public string MessageType { get; set; } = null!;
    public DeliveryStatus DeliveryStatus { get; set; } = DeliveryStatus.Pending;
    public string? ProviderMessageId { get; set; }
    public DateTimeOffset? SentAt { get; set; }
    public DateTimeOffset? DeliveredAt { get; set; }
    public DateTimeOffset? FailedAt { get; set; }
    public int RetryCount { get; set; }
    public string? FailureReason { get; set; }

    public Event Event { get; set; } = null!;
}
"@
Set-Content -Path "$modelsPath\DeliveryLog.cs" -Value $deliveryLogCs
