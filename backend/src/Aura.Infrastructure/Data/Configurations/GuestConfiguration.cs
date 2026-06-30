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
