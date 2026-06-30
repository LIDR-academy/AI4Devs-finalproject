using Aura.Core.Models;
using Aura.Infrastructure.Data.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class LiveMessageConfiguration : IEntityTypeConfiguration<LiveMessage>
{
    public void Configure(EntityTypeBuilder<LiveMessage> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId);
        builder.HasIndex(e => e.AccompliceId);
        
        builder.Property(e => e.CustomMessage).HasConversion(new EncryptedStringConverter());
        builder.Property(e => e.SentVia).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.DeliveryStatus).HasConversion<string>().HasMaxLength(20);
    }
}
