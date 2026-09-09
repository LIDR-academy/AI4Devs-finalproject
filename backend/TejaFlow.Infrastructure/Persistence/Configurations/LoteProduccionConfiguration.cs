using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class LoteProduccionConfiguration : IEntityTypeConfiguration<LoteProduccion>
{
    public void Configure(EntityTypeBuilder<LoteProduccion> builder)
    {
        builder.ToTable("LOTE_PRODUCCION", table =>
        {
            table.HasCheckConstraint("CK_LOTE_CANTIDAD_INICIAL", "cantidad_inicial > 0");
            table.HasCheckConstraint("CK_LOTE_CANTIDAD_ACTUAL", "cantidad_actual >= 0");
        });
        builder.HasKey(lote => lote.IdLote);

        builder.Property(lote => lote.IdLote).HasColumnName("id_lote");
        builder.Property(lote => lote.IdTeja).HasColumnName("id_teja").IsRequired();
        builder.Property(lote => lote.CodigoLote).HasColumnName("codigo_lote").HasMaxLength(50).IsRequired();
        builder.Property(lote => lote.FechaEntrada).HasColumnName("fecha_entrada").HasDefaultValueSql("GETDATE()").IsRequired();
        builder.Property(lote => lote.CantidadInicial).HasColumnName("cantidad_inicial").IsRequired();
        builder.Property(lote => lote.CantidadActual).HasColumnName("cantidad_actual").IsRequired();

        builder.HasIndex(lote => lote.CodigoLote).IsUnique();
        builder.HasIndex(lote => new { lote.IdTeja, lote.CantidadActual }).HasDatabaseName("IX_LOTE_TEJA_ACTUAL");

        builder
            .HasOne(lote => lote.Teja)
            .WithMany(teja => teja.Lotes)
            .HasForeignKey(lote => lote.IdTeja)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new LoteProduccion
            {
                IdLote = 1,
                IdTeja = 1,
                CodigoLote = "LOT-2026-B01",
                FechaEntrada = new DateTime(2026, 1, 15, 9, 0, 0),
                CantidadInicial = 5000,
                CantidadActual = 5000
            },
            new LoteProduccion
            {
                IdLote = 2,
                IdTeja = 1,
                CodigoLote = "LOT-2026-B02",
                FechaEntrada = new DateTime(2026, 1, 20, 9, 0, 0),
                CantidadInicial = 3000,
                CantidadActual = 3000
            },
            new LoteProduccion
            {
                IdLote = 3,
                IdTeja = 2,
                CodigoLote = "LOT-2026-C01",
                FechaEntrada = new DateTime(2026, 2, 1, 9, 0, 0),
                CantidadInicial = 4500,
                CantidadActual = 4500
            },
            new LoteProduccion
            {
                IdLote = 4,
                IdTeja = 3,
                CodigoLote = "LOT-2026-F01",
                FechaEntrada = new DateTime(2026, 2, 10, 9, 0, 0),
                CantidadInicial = 2200,
                CantidadActual = 2200
            });
    }
}
