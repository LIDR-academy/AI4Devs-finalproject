using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class PagoVentaConfiguration : IEntityTypeConfiguration<PagoVenta>
{
    public void Configure(EntityTypeBuilder<PagoVenta> builder)
    {
        builder.ToTable("PAGO_VENTA", table =>
        {
            table.HasCheckConstraint("CK_PAGO_MONTO", "monto > 0");
            table.HasCheckConstraint("CK_PAGO_METODO", "metodo_pago IN ('Efectivo', 'TarjetaCredito', 'TarjetaDebito')");
            table.HasCheckConstraint("CK_PAGO_ESTADO", "estado_pago IN ('Pendiente', 'Pagado', 'Rechazado', 'Reembolsado')");
        });
        builder.HasKey(pago => pago.IdPago);

        builder.Property(pago => pago.IdPago).HasColumnName("id_pago");
        builder.Property(pago => pago.IdPedido).HasColumnName("id_pedido").IsRequired();
        builder.Property(pago => pago.MetodoPago).HasColumnName("metodo_pago").HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(pago => pago.EstadoPago).HasColumnName("estado_pago").HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(pago => pago.Monto).HasColumnName("monto").HasPrecision(12, 2).IsRequired();
        builder.Property(pago => pago.FechaPago).HasColumnName("fecha_pago").HasDefaultValueSql("GETDATE()").IsRequired();
        builder.Property(pago => pago.Referencia).HasColumnName("referencia").HasMaxLength(100).IsRequired();

        builder.HasIndex(pago => pago.MetodoPago);

        builder
            .HasOne(pago => pago.Pedido)
            .WithMany(pedido => pedido.Pagos)
            .HasForeignKey(pago => pago.IdPedido)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new PagoVenta
            {
                IdPago = 1,
                IdPedido = 1,
                MetodoPago = MetodoPago.TarjetaDebito,
                EstadoPago = EstadoPago.Pagado,
                Monto = 46713.40m,
                FechaPago = new DateTime(2026, 2, 15, 10, 15, 0),
                Referencia = "SEED-PAGO-0001"
            });
    }
}
