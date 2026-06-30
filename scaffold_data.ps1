$dataPath = "c:\repos\AI4Devs-finalproject\backend\src\Aura.Infrastructure\Data"
$convertersPath = "$dataPath\Converters"
$configurationsPath = "$dataPath\Configurations"
$repositoriesPath = "c:\repos\AI4Devs-finalproject\backend\src\Aura.Infrastructure\Repositories"

New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
New-Item -ItemType Directory -Force -Path $convertersPath | Out-Null
New-Item -ItemType Directory -Force -Path $configurationsPath | Out-Null
New-Item -ItemType Directory -Force -Path $repositoriesPath | Out-Null

$converterCs = @"
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Aura.Infrastructure.Data.Converters;

// A simple mock for PII Encryption. In production, this would use AES-256 via a KMS.
public class EncryptedStringConverter : ValueConverter<string?, string?>
{
    public EncryptedStringConverter()
        : base(
            v => v == null ? null : $"ENCRYPTED_{v}",
            v => v == null ? null : (v.StartsWith("ENCRYPTED_") ? v.Substring(10) : v)
        )
    {
    }
}
"@
Set-Content -Path "$convertersPath\EncryptedStringConverter.cs" -Value $converterCs

$contextCs = @"
using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace Aura.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserConsent> UserConsents => Set<UserConsent>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Template> Templates => Set<Template>();
    public DbSet<Guest> Guests => Set<Guest>();
    public DbSet<Invitation> Invitations => Set<Invitation>();
    public DbSet<Rsvp> Rsvps => Set<Rsvp>();
    public DbSet<Accomplice> Accomplices => Set<Accomplice>();
    public DbSet<MessageTemplate> MessageTemplates => Set<MessageTemplate>();
    public DbSet<LiveMessage> LiveMessages => Set<LiveMessage>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<DataRetentionJob> DataRetentionJobs => Set<DataRetentionJob>();
    public DbSet<DeliveryLog> DeliveryLogs => Set<DeliveryLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Add extension for PostgreSQL uuid generation
        modelBuilder.HasPostgresExtension("uuid-ossp");
        
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
"@
Set-Content -Path "$dataPath\ApplicationDbContext.cs" -Value $contextCs
