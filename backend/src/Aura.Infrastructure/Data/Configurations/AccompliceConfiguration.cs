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
