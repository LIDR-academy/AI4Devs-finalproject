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
