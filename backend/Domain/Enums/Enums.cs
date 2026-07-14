namespace InkLink.Api.Domain.Enums;

public enum UserRole
{
    Client,
    Artist,
    Admin
}

public enum ArtistType
{
    Independent,
    Studio
}

public enum CancellationPolicy
{
    Hours24,
    Hours48,
    Hours72
}

public enum BookingStatus
{
    PendingPayment,
    Confirmed,
    Completed,
    Cancelled
}

public enum PaymentStatus
{
    Pending,
    Completed,
    Refunded
}

public enum CertificationType
{
    Sanitary,
    Biosecurity,
    Municipal
}

public enum SponsorshipRelationType
{
    Ambassador,
    Sponsored,
    Certified
}
