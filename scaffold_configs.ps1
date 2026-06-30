$configsPath = "c:\repos\AI4Devs-finalproject\backend\src\Aura.Infrastructure\Data\Configurations"

$userConfig = @"
using Aura.Core.Models;
using Aura.Infrastructure.Data.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.Email).IsUnique();
        builder.HasIndex(e => e.HashedMagicLinkToken);
        builder.HasIndex(e => e.Status);
        
        builder.Property(e => e.Email).HasMaxLength(320).IsRequired();
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.HashedMagicLinkToken).HasMaxLength(256);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Timezone).HasMaxLength(64);
        builder.Property(e => e.Locale).HasMaxLength(10);
        
        builder.HasMany(e => e.Events).WithOne(e => e.User).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(e => e.Consents).WithOne(e => e.User).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
"@
Set-Content -Path "$configsPath\UserConfiguration.cs" -Value $userConfig

$userConsentConfig = @"
using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class UserConsentConfiguration : IEntityTypeConfiguration<UserConsent>
{
    public void Configure(EntityTypeBuilder<UserConsent> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => new { e.UserId, e.ConsentType });
        
        builder.Property(e => e.ConsentType).HasConversion<string>().HasMaxLength(50);
        builder.Property(e => e.TermsVersion).HasMaxLength(20);
    }
}
"@
Set-Content -Path "$configsPath\UserConsentConfiguration.cs" -Value $userConsentConfig

$eventConfig = @"
using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class EventConfiguration : IEntityTypeConfiguration<Event>
{
    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.Slug).IsUnique();
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.EventDate);
        builder.HasIndex(e => e.EventEndDate);
        
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Slug).HasMaxLength(200).IsRequired();
        builder.Property(e => e.PrimaryColor).HasMaxLength(7);
        builder.Property(e => e.SecondaryColor).HasMaxLength(7);
        builder.Property(e => e.FontFamily).HasMaxLength(100);
        builder.Property(e => e.HeroImageUrl).HasMaxLength(500);
        builder.Property(e => e.CoupleNames).HasMaxLength(200);
        builder.Property(e => e.VenueName).HasMaxLength(200);
        builder.Property(e => e.VenueAddress).HasMaxLength(500);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.VenueLat).HasPrecision(9, 6);
        builder.Property(e => e.VenueLng).HasPrecision(9, 6);
        
        builder.Property(e => e.EventEndDate).HasComputedColumnSql("\"EventDate\" + INTERVAL '1 day'", stored: true);
        
        builder.HasMany(e => e.Guests).WithOne(e => e.Event).HasForeignKey(e => e.EventId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(e => e.Invitations).WithOne(e => e.Event).HasForeignKey(e => e.EventId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(e => e.Accomplices).WithOne(e => e.Event).HasForeignKey(e => e.EventId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(e => e.MessageTemplates).WithOne(e => e.Event).HasForeignKey(e => e.EventId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(e => e.LiveMessages).WithOne(e => e.Event).HasForeignKey(e => e.EventId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(e => e.DeliveryLogs).WithOne(e => e.Event).HasForeignKey(e => e.EventId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.Payment).WithOne(e => e.Event).HasForeignKey<Payment>(e => e.EventId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(e => e.DataRetentionJob).WithOne(e => e.Event).HasForeignKey<DataRetentionJob>(e => e.EventId).OnDelete(DeleteBehavior.Cascade);
    }
}
"@
Set-Content -Path "$configsPath\EventConfiguration.cs" -Value $eventConfig

$templateConfig = @"
using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class TemplateConfiguration : IEntityTypeConfiguration<Template>
{
    public void Configure(EntityTypeBuilder<Template> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.Category);
        
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.Property(e => e.PreviewUrl).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Category).HasMaxLength(50);
        builder.Property(e => e.LayoutJson).HasColumnType("jsonb");
    }
}
"@
Set-Content -Path "$configsPath\TemplateConfiguration.cs" -Value $templateConfig

$guestConfig = @"
using Aura.Core.Models;
using Aura.Infrastructure.Data.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class GuestConfiguration : IEntityTypeConfiguration<Guest>
{
    public void Configure(EntityTypeBuilder<Guest> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId);
        builder.HasIndex(e => new { e.EventId, e.Category });
        builder.HasIndex(e => new { e.EventId, e.Email });
        
        builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Email).HasMaxLength(320);
        builder.Property(e => e.Phone).HasMaxLength(30).HasConversion(new EncryptedStringConverter());
        builder.Property(e => e.Category).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.InviteStatus).HasConversion<string>().HasMaxLength(20);
        
        builder.HasQueryFilter(e => !e.IsDeleted);
        
        builder.HasMany(e => e.Invitations).WithOne(e => e.Guest).HasForeignKey(e => e.GuestId).OnDelete(DeleteBehavior.Cascade);
    }
}
"@
Set-Content -Path "$configsPath\GuestConfiguration.cs" -Value $guestConfig

$invitationConfig = @"
using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class InvitationConfiguration : IEntityTypeConfiguration<Invitation>
{
    public void Configure(EntityTypeBuilder<Invitation> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.GuestId);
        builder.HasIndex(e => e.EventId);
        builder.HasIndex(e => e.TokenHash).IsUnique();
        builder.HasIndex(e => new { e.DeliveryStatus, e.SentVia });
        
        builder.Property(e => e.TokenHash).HasMaxLength(256).IsRequired();
        builder.Property(e => e.SentVia).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.DeliveryStatus).HasConversion<string>().HasMaxLength(20);
        
        builder.HasQueryFilter(e => !e.IsDeleted);
        
        builder.HasOne(e => e.Rsvp).WithOne(e => e.Invitation).HasForeignKey<Rsvp>(e => e.InvitationId).OnDelete(DeleteBehavior.Cascade);
    }
}
"@
Set-Content -Path "$configsPath\InvitationConfiguration.cs" -Value $invitationConfig

$rsvpConfig = @"
using Aura.Core.Models;
using Aura.Infrastructure.Data.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class RsvpConfiguration : IEntityTypeConfiguration<Rsvp>
{
    public void Configure(EntityTypeBuilder<Rsvp> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId);
        builder.HasIndex(e => e.GuestId);
        builder.HasIndex(e => new { e.EventId, e.Attendance });
        
        builder.Property(e => e.Attendance).HasConversion<string>().HasMaxLength(10);
        builder.Property(e => e.DietaryRestrictions).HasConversion(new EncryptedStringConverter());
        builder.Property(e => e.Message).HasConversion(new EncryptedStringConverter());
    }
}
"@
Set-Content -Path "$configsPath\RsvpConfiguration.cs" -Value $rsvpConfig

$accompliceConfig = @"
using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class AccompliceConfiguration : IEntityTypeConfiguration<Accomplice>
{
    public void Configure(EntityTypeBuilder<Accomplice> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId);
        builder.HasIndex(e => e.TokenHash).IsUnique();
        builder.HasIndex(e => e.ExpiresAt);
        
        builder.Property(e => e.Email).HasMaxLength(320).IsRequired();
        builder.Property(e => e.TokenHash).HasMaxLength(256).IsRequired();
        builder.Property(e => e.Permissions).HasColumnType("jsonb");
        
        builder.HasMany(e => e.LiveMessages).WithOne(e => e.Accomplice).HasForeignKey(e => e.AccompliceId).OnDelete(DeleteBehavior.Restrict);
    }
}
"@
Set-Content -Path "$configsPath\AccompliceConfiguration.cs" -Value $accompliceConfig

$messageTemplateConfig = @"
using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class MessageTemplateConfiguration : IEntityTypeConfiguration<MessageTemplate>
{
    public void Configure(EntityTypeBuilder<MessageTemplate> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId);
        
        builder.Property(e => e.Label).HasMaxLength(100).IsRequired();
        builder.Property(e => e.DefaultMessage).IsRequired();
        builder.Property(e => e.Icon).HasMaxLength(50).IsRequired();
        
        builder.HasQueryFilter(e => !e.IsDeleted);
        
        builder.HasMany(e => e.LiveMessages).WithOne(e => e.MessageTemplate).HasForeignKey(e => e.MessageTemplateId).OnDelete(DeleteBehavior.Restrict);
    }
}
"@
Set-Content -Path "$configsPath\MessageTemplateConfiguration.cs" -Value $messageTemplateConfig

$liveMessageConfig = @"
using Aura.Core.Models;
using Aura.Infrastructure.Data.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class LiveMessageConfiguration : IEntityTypeConfiguration<LiveMessage>
{
    public void Configure(EntityTypeBuilder<LiveMessage> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId);
        builder.HasIndex(e => e.AccompliceId);
        
        builder.Property(e => e.CustomMessage).HasConversion(new EncryptedStringConverter());
        builder.Property(e => e.SentVia).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.DeliveryStatus).HasConversion<string>().HasMaxLength(20);
    }
}
"@
Set-Content -Path "$configsPath\LiveMessageConfiguration.cs" -Value $liveMessageConfig

$paymentConfig = @"
using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId).IsUnique();
        builder.HasIndex(e => e.StripePaymentIntentId).IsUnique();
        
        builder.Property(e => e.StripePaymentIntentId).HasMaxLength(255);
        builder.Property(e => e.StripeCustomerId).HasMaxLength(255);
        builder.Property(e => e.Currency).HasMaxLength(3);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Tier).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Amount).HasPrecision(10, 2);
    }
}
"@
Set-Content -Path "$configsPath\PaymentConfiguration.cs" -Value $paymentConfig

$dataRetentionJobConfig = @"
using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class DataRetentionJobConfiguration : IEntityTypeConfiguration<DataRetentionJob>
{
    public void Configure(EntityTypeBuilder<DataRetentionJob> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId).IsUnique();
        builder.HasIndex(e => new { e.ScheduledDeleteAt, e.Status });
        
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
    }
}
"@
Set-Content -Path "$configsPath\DataRetentionJobConfiguration.cs" -Value $dataRetentionJobConfig

$deliveryLogConfig = @"
using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class DeliveryLogConfiguration : IEntityTypeConfiguration<DeliveryLog>
{
    public void Configure(EntityTypeBuilder<DeliveryLog> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId);
        builder.HasIndex(e => new { e.EntityType, e.EntityId });
        builder.HasIndex(e => new { e.DeliveryStatus, e.Channel });
        
        builder.Property(e => e.EntityType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Channel).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.MessageType).HasMaxLength(50);
        builder.Property(e => e.DeliveryStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.ProviderMessageId).HasMaxLength(255);
    }
}
"@
Set-Content -Path "$configsPath\DeliveryLogConfiguration.cs" -Value $deliveryLogConfig

$depInjection = @"
using Aura.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aura.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .UseSnakeCaseNamingConvention();
        });

        return services;
    }
}
"@
Set-Content -Path "c:\repos\AI4Devs-finalproject\backend\src\Aura.Infrastructure\DependencyInjection.cs" -Value $depInjection

