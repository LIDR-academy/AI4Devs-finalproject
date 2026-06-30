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
