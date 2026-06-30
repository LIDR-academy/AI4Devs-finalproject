using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class TemplateConfiguration : IEntityTypeConfiguration<Template>
{
    public void Configure(EntityTypeBuilder<Template> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.Category);
        
        builder.Property(e => e.Name).HasMaxLength(100).IsRequired();
        builder.Property(e => e.PreviewUrl).HasMaxLength(500).IsRequired();
        builder.Property(e => e.Category).HasMaxLength(50);
        builder.Property(e => e.LayoutJson).HasColumnType("jsonb");
    }
}
