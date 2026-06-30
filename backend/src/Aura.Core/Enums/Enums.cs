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
