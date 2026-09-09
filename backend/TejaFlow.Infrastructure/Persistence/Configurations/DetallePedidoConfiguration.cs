using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class DetallePedidoConfiguration : IEntityTypeConfiguration<DetallePedido>
{
    public void Configure(EntityTypeBuilder<DetallePedido> builder)
    {
        builder.ToTable("DETALLE_PEDIDO", table =>
        {
            table.HasCheckConstraint("CK_DETALLE_CANTIDADES", "cantidad_solicitada > 0 AND cantidad_despachada >= 0 AND cantidad_despachada <= cantidad_solicitada");
            table.HasCheckConstraint("CK_DETALLE_PRECIO", "precio_unitario_aplicado >= 0");
            table.HasCheckConstraint("CK_DETALLE_CALCULO_TECHO", "pendiente_techo_grados >= 0 AND pendiente_techo_grados <= 90 AND metros_cuadrados_calculados > 0");
        });
        builder.HasKey(detalle => detalle.IdDetalle);

        builder.Property(detalle => detalle.IdDetalle).HasColumnName("id_detalle");
        builder.Property(detalle => detalle.IdPedido).HasColumnName("id_pedido").IsRequired();
        builder.Property(detalle => detalle.IdTeja).HasColumnName("id_teja").IsRequired();
        builder.Property(detalle => detalle.CantidadSolicitada).HasColumnName("cantidad_solicitada").IsRequired();
        builder.Property(detalle => detalle.CantidadDespachada).HasColumnName("cantidad_despachada").HasDefaultValue(0).IsRequired();
        builder.Property(detalle => detalle.PrecioUnitarioAplicado).HasColumnName("precio_unitario_aplicado").HasPrecision(10, 2).IsRequired();
        builder.Property(detalle => detalle.PendienteTechoGrados).HasColumnName("pendiente_techo_grados").HasPrecision(5, 2).IsRequired();
        builder.Property(detalle => detalle.MetrosCuadradosCalculados).HasColumnName("metros_cuadrados_calculados").HasPrecision(10, 2).IsRequired();

        builder.Ignore(detalle => detalle.Subtotal);
        builder.Ignore(detalle => detalle.CantidadPendiente);

        builder
            .HasOne(detalle => detalle.Pedido)
            .WithMany(pedido => pedido.Detalles)
            .HasForeignKey(detalle => detalle.IdPedido)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(detalle => detalle.Teja)
            .WithMany(teja => teja.DetallesPedido)
            .HasForeignKey(detalle => detalle.IdTeja)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasData(
            new DetallePedido
            {
                IdDetalle = 1,
                IdPedido = 1,
                IdTeja = 1,
                CantidadSolicitada = 1694,
                CantidadDespachada = 0,
                PrecioUnitarioAplicado = 22.50m,
                PendienteTechoGrados = 30.00m,
                MetrosCuadradosCalculados = 138.56m
            });
    }
}
