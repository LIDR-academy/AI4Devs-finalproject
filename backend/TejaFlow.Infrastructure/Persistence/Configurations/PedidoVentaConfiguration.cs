using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class PedidoVentaConfiguration : IEntityTypeConfiguration<PedidoVenta>
{
    public void Configure(EntityTypeBuilder<PedidoVenta> builder)
    {
        builder.ToTable("PEDIDO_VENTA", table =>
        {
            table.HasCheckConstraint("CK_PEDIDO_IMPORTES", "subtotal >= 0 AND impuesto_iva >= 0 AND costo_flete >= 0 AND total >= 0");
            table.HasCheckConstraint("CK_PEDIDO_ESTADO", "estado_pedido IN ('Cotizacion', 'Pagado', 'Parcial', 'Despachado', 'Cancelado')");
        });
        builder.HasKey(pedido => pedido.IdPedido);

        builder.Property(pedido => pedido.IdPedido).HasColumnName("id_pedido");
        builder.Property(pedido => pedido.IdCliente).HasColumnName("id_cliente").IsRequired();
        builder.Property(pedido => pedido.IdUsuario).HasColumnName("id_usuario").IsRequired();
        builder.Property(pedido => pedido.FechaPedido).HasColumnName("fecha_pedido").HasDefaultValueSql("GETDATE()").IsRequired();
        builder.Property(pedido => pedido.Subtotal).HasColumnName("subtotal").HasPrecision(12, 2).IsRequired();
        builder.Property(pedido => pedido.ImpuestoIva).HasColumnName("impuesto_iva").HasPrecision(12, 2).IsRequired();
        builder.Property(pedido => pedido.CostoFlete).HasColumnName("costo_flete").HasPrecision(12, 2).IsRequired();
        builder.Property(pedido => pedido.Total).HasColumnName("total").HasPrecision(12, 2).IsRequired();
        builder.Property(pedido => pedido.EstadoPedido).HasColumnName("estado_pedido").HasConversion<string>().HasMaxLength(30).IsRequired();

        builder.HasIndex(pedido => pedido.FechaPedido);
        builder.HasIndex(pedido => pedido.EstadoPedido);

        builder
            .HasOne(pedido => pedido.Cliente)
            .WithMany(cliente => cliente.Pedidos)
            .HasForeignKey(pedido => pedido.IdCliente)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(pedido => pedido.Usuario)
            .WithMany(usuario => usuario.Pedidos)
            .HasForeignKey(pedido => pedido.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new PedidoVenta
            {
                IdPedido = 1,
                IdCliente = 1,
                IdUsuario = 2,
                FechaPedido = new DateTime(2026, 2, 15, 10, 0, 0),
                Subtotal = 38115.00m,
                ImpuestoIva = 6098.40m,
                CostoFlete = 2500.00m,
                Total = 46713.40m,
                EstadoPedido = EstadoPedido.Pagado
            });
    }
}
