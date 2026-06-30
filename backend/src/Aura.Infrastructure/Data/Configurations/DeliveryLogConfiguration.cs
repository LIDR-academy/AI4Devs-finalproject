using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class DeliveryLogConfiguration : IEntityTypeConfiguration<DeliveryLog>
{
    public void Configure(EntityTypeBuilder<DeliveryLog> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId);
        builder.HasIndex(e => new { e.EntityType, e.EntityId });
        builder.HasIndex(e => new { e.DeliveryStatus, e.Channel });
        
        builder.Property(e => e.EntityType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Channel).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.MessageType).HasMaxLength(50);
        builder.Property(e => e.DeliveryStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.ProviderMessageId).HasMaxLength(255);
    }
}
