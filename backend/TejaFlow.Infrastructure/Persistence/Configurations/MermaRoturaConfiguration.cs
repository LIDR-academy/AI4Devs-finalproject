using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class MermaRoturaConfiguration : IEntityTypeConfiguration<MermaRotura>
{
    public void Configure(EntityTypeBuilder<MermaRotura> builder)
    {
        builder.ToTable("MERMA_ROTURA", table =>
        {
            table.HasCheckConstraint("CK_MERMA_CANTIDAD_ROTAS", "cantidad_rotas > 0");
        });
        builder.HasKey(merma => merma.IdMerma);

        builder.Property(merma => merma.IdMerma).HasColumnName("id_merma");
        builder.Property(merma => merma.IdLote).HasColumnName("id_lote").IsRequired();
        builder.Property(merma => merma.IdUsuario).HasColumnName("id_usuario").IsRequired();
        builder.Property(merma => merma.CantidadRotas).HasColumnName("cantidad_rotas").IsRequired();
        builder.Property(merma => merma.FechaRegistro).HasColumnName("fecha_registro").HasDefaultValueSql("GETDATE()").IsRequired();
        builder.Property(merma => merma.Motivo).HasColumnName("motivo").HasMaxLength(255).IsRequired();

        builder
            .HasOne(merma => merma.Lote)
            .WithMany(lote => lote.Mermas)
            .HasForeignKey(merma => merma.IdLote)
            .OnDelete(DeleteBehavior.NoAction);

        builder
            .HasOne(merma => merma.Usuario)
            .WithMany(usuario => usuario.Mermas)
            .HasForeignKey(merma => merma.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new MermaRotura
            {
                IdMerma = 1,
                IdLote = 1,
                IdUsuario = 3,
                CantidadRotas = 25,
                FechaRegistro = new DateTime(2026, 2, 12, 11, 30, 0),
                Motivo = "Rotura detectada durante acomodo en patio"
            });
    }
}
