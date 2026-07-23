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
        
        builder.Property(e => e.ThankYouMessage).HasMaxLength(1000);
        builder.Property(e => e.PhotoGalleryUrl).HasMaxLength(500);
        
        // builder.Property(e => e.EventEndDate).HasComputedColumnSql("event_date + INTERVAL '1 day'", stored: true);
        
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
