using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class MovimientoInventarioConfiguration : IEntityTypeConfiguration<MovimientoInventario>
{
    public void Configure(EntityTypeBuilder<MovimientoInventario> builder)
    {
        builder.ToTable("MOVIMIENTO_INVENTARIO", table =>
        {
            table.HasCheckConstraint("CK_MOVIMIENTO_CANTIDAD", "cantidad <> 0");
            table.HasCheckConstraint("CK_MOVIMIENTO_TIPO", "tipo_movimiento IN ('EntradaLote', 'Venta', 'Merma', 'DespachoParcial', 'AjusteManual')");
        });
        builder.HasKey(movimiento => movimiento.IdMovimiento);

        builder.Property(movimiento => movimiento.IdMovimiento).HasColumnName("id_movimiento");
        builder.Property(movimiento => movimiento.IdLote).HasColumnName("id_lote").IsRequired();
        builder.Property(movimiento => movimiento.IdPedido).HasColumnName("id_pedido");
        builder.Property(movimiento => movimiento.IdMerma).HasColumnName("id_merma");
        builder.Property(movimiento => movimiento.IdUsuario).HasColumnName("id_usuario").IsRequired();
        builder.Property(movimiento => movimiento.TipoMovimiento).HasColumnName("tipo_movimiento").HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(movimiento => movimiento.Cantidad).HasColumnName("cantidad").IsRequired();
        builder.Property(movimiento => movimiento.FechaMovimiento).HasColumnName("fecha_movimiento").HasDefaultValueSql("GETDATE()").IsRequired();
        builder.Property(movimiento => movimiento.Referencia).HasColumnName("referencia").HasMaxLength(120).IsRequired();

        builder.HasIndex(movimiento => new { movimiento.IdLote, movimiento.FechaMovimiento });

        builder
            .HasOne(movimiento => movimiento.Lote)
            .WithMany(lote => lote.Movimientos)
            .HasForeignKey(movimiento => movimiento.IdLote)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(movimiento => movimiento.Pedido)
            .WithMany(pedido => pedido.Movimientos)
            .HasForeignKey(movimiento => movimiento.IdPedido)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(movimiento => movimiento.Merma)
            .WithMany(merma => merma.Movimientos)
            .HasForeignKey(movimiento => movimiento.IdMerma)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(movimiento => movimiento.Usuario)
            .WithMany(usuario => usuario.MovimientosInventario)
            .HasForeignKey(movimiento => movimiento.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new MovimientoInventario
            {
                IdMovimiento = 1,
                IdLote = 1,
                IdMerma = 1,
                IdUsuario = 3,
                TipoMovimiento = TipoMovimientoInventario.Merma,
                Cantidad = -25,
                FechaMovimiento = new DateTime(2026, 2, 12, 11, 30, 0),
                Referencia = "MERMA-SEED-0001"
            });
    }
}
