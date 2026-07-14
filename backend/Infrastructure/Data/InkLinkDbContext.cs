using InkLink.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InkLink.Api.Infrastructure.Data;

public class InkLinkDbContext : DbContext
{
    public InkLinkDbContext(DbContextOptions<InkLinkDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<ArtistProfile> ArtistProfiles => Set<ArtistProfile>();
    public DbSet<PortfolioItem> PortfolioItems => Set<PortfolioItem>();
    public DbSet<TattooStyle> TattooStyles => Set<TattooStyle>();
    public DbSet<ArtistStyle> ArtistStyles => Set<ArtistStyle>();
    public DbSet<Availability> Availabilities => Set<Availability>();
    public DbSet<BlockedDate> BlockedDates => Set<BlockedDate>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Certification> Certifications => Set<Certification>();
    public DbSet<Award> Awards => Set<Award>();
    public DbSet<Sponsorship> Sponsorships => Set<Sponsorship>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Enums stored as VARCHAR with application-level validation (per data model notes)
        configurationBuilder.Properties<Enum>().HaveConversion<string>().HaveMaxLength(30);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).HasMaxLength(255).IsRequired();
            entity.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(u => u.LastName).HasMaxLength(100).IsRequired();
            entity.Property(u => u.Phone).HasMaxLength(20);
            entity.Property(u => u.AvatarUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<ArtistProfile>(entity =>
        {
            entity.HasIndex(a => a.UserId).IsUnique();
            entity.HasIndex(a => a.Slug).IsUnique();
            entity.HasIndex(a => a.Commune);
            entity.HasIndex(a => a.IsPublished);
            entity.HasIndex(a => a.RatingAvg);
            entity.Property(a => a.Slug).HasMaxLength(100).IsRequired();
            entity.Property(a => a.Bio).HasMaxLength(2000);
            entity.Property(a => a.Latitude).HasPrecision(10, 8);
            entity.Property(a => a.Longitude).HasPrecision(11, 8);
            entity.Property(a => a.Address).HasMaxLength(300);
            entity.Property(a => a.Commune).HasMaxLength(100).IsRequired();
            entity.Property(a => a.DepositPercentage).HasDefaultValue(30);
            entity.Property(a => a.RatingAvg).HasPrecision(3, 2);
            entity.HasOne(a => a.User)
                  .WithOne(u => u.ArtistProfile)
                  .HasForeignKey<ArtistProfile>(a => a.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PortfolioItem>(entity =>
        {
            entity.Property(p => p.ImageUrl).HasMaxLength(500).IsRequired();
            entity.Property(p => p.ThumbnailUrl).HasMaxLength(500);
            entity.Property(p => p.Description).HasMaxLength(500);
            entity.HasOne(p => p.ArtistProfile)
                  .WithMany(a => a.PortfolioItems)
                  .HasForeignKey(p => p.ArtistProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(p => p.Style)
                  .WithMany(s => s.PortfolioItems)
                  .HasForeignKey(p => p.StyleId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<TattooStyle>(entity =>
        {
            entity.HasIndex(s => s.Name).IsUnique();
            entity.HasIndex(s => s.Slug).IsUnique();
            entity.Property(s => s.Name).HasMaxLength(50).IsRequired();
            entity.Property(s => s.Slug).HasMaxLength(50).IsRequired();
            entity.Property(s => s.IconUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<ArtistStyle>(entity =>
        {
            entity.HasKey(x => new { x.ArtistProfileId, x.StyleId });
            entity.HasOne(x => x.ArtistProfile)
                  .WithMany(a => a.ArtistStyles)
                  .HasForeignKey(x => x.ArtistProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Style)
                  .WithMany(s => s.ArtistStyles)
                  .HasForeignKey(x => x.StyleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Availability>(entity =>
        {
            entity.HasOne(a => a.ArtistProfile)
                  .WithMany(p => p.Availabilities)
                  .HasForeignKey(a => a.ArtistProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BlockedDate>(entity =>
        {
            entity.HasIndex(b => new { b.ArtistProfileId, b.Date }).IsUnique();
            entity.Property(b => b.Reason).HasMaxLength(200);
            entity.HasOne(b => b.ArtistProfile)
                  .WithMany(p => p.BlockedDates)
                  .HasForeignKey(b => b.ArtistProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasIndex(b => b.BookingDate);
            entity.HasIndex(b => b.Status);
            entity.Property(b => b.BodyZone).HasMaxLength(100);
            entity.Property(b => b.SizeReference).HasMaxLength(50);
            entity.Property(b => b.ReferenceImages).HasColumnType("jsonb");
            // Bookings are preserved for audit: no cascade delete from client/artist
            entity.HasOne(b => b.Client)
                  .WithMany(u => u.Bookings)
                  .HasForeignKey(b => b.ClientId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.ArtistProfile)
                  .WithMany(a => a.Bookings)
                  .HasForeignKey(b => b.ArtistProfileId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.Style)
                  .WithMany()
                  .HasForeignKey(b => b.StyleId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasIndex(p => p.BookingId).IsUnique();
            entity.Property(p => p.FlowTransactionId).HasMaxLength(100);
            entity.HasOne(p => p.Booking)
                  .WithOne(b => b.Payment)
                  .HasForeignKey<Payment>(p => p.BookingId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasIndex(r => r.BookingId).IsUnique();
            entity.Property(r => r.Comment).HasMaxLength(2000);
            entity.Property(r => r.TattooPhotoUrl).HasMaxLength(500);
            entity.HasOne(r => r.Booking)
                  .WithOne(b => b.Review)
                  .HasForeignKey<Review>(r => r.BookingId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(r => r.Client)
                  .WithMany()
                  .HasForeignKey(r => r.ClientId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(r => r.ArtistProfile)
                  .WithMany()
                  .HasForeignKey(r => r.ArtistProfileId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Certification>(entity =>
        {
            entity.HasIndex(c => c.IsActive);
            entity.Property(c => c.Name).HasMaxLength(200).IsRequired();
            entity.Property(c => c.Issuer).HasMaxLength(200).IsRequired();
            entity.HasOne(c => c.ArtistProfile)
                  .WithMany(a => a.Certifications)
                  .HasForeignKey(c => c.ArtistProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Award>(entity =>
        {
            entity.Property(a => a.Title).HasMaxLength(200).IsRequired();
            entity.Property(a => a.EventName).HasMaxLength(200).IsRequired();
            entity.Property(a => a.Category).HasMaxLength(100);
            entity.Property(a => a.BadgeIconUrl).HasMaxLength(500);
            entity.HasOne(a => a.ArtistProfile)
                  .WithMany(p => p.Awards)
                  .HasForeignKey(a => a.ArtistProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Sponsorship>(entity =>
        {
            entity.Property(s => s.BrandName).HasMaxLength(200).IsRequired();
            entity.Property(s => s.BrandLogoUrl).HasMaxLength(500);
            entity.HasOne(s => s.ArtistProfile)
                  .WithMany(a => a.Sponsorships)
                  .HasForeignKey(s => s.ArtistProfileId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
