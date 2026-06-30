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
