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
