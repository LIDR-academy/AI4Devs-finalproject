using Aura.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aura.Infrastructure.Data.Configurations;

public class MessageTemplateConfiguration : IEntityTypeConfiguration<MessageTemplate>
{
    public void Configure(EntityTypeBuilder<MessageTemplate> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasIndex(e => e.EventId);
        
        builder.Property(e => e.Label).HasMaxLength(100).IsRequired();
        builder.Property(e => e.DefaultMessage).IsRequired();
        builder.Property(e => e.Icon).HasMaxLength(50).IsRequired();
        
        builder.HasQueryFilter(e => !e.IsDeleted);
        
        builder.HasMany(e => e.LiveMessages).WithOne(e => e.MessageTemplate).HasForeignKey(e => e.MessageTemplateId).OnDelete(DeleteBehavior.Restrict);
    }
}
