using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId).IsUnique();
        builder.HasIndex(e => e.StripePaymentIntentId).IsUnique();
        
        builder.Property(e => e.StripePaymentIntentId).HasMaxLength(255);
        builder.Property(e => e.StripeCustomerId).HasMaxLength(255);
        builder.Property(e => e.Currency).HasMaxLength(3);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Tier).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.Amount).HasPrecision(10, 2);
    }
}
