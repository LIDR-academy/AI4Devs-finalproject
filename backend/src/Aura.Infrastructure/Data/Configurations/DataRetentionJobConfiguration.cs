using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class DataRetentionJobConfiguration : IEntityTypeConfiguration<DataRetentionJob>
{
    public void Configure(EntityTypeBuilder<DataRetentionJob> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId).IsUnique();
        builder.HasIndex(e => new { e.ScheduledDeleteAt, e.Status });
        
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
    }
}
