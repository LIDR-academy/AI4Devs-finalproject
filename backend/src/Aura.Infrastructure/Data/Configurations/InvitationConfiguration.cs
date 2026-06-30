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
