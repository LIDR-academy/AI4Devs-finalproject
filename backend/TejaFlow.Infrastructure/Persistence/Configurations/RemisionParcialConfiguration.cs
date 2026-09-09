using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class RemisionParcialConfiguration : IEntityTypeConfiguration<RemisionParcial>
{
    public void Configure(EntityTypeBuilder<RemisionParcial> builder)
    {
        builder.ToTable("REMISION_PARCIAL", table =>
        {
            table.HasCheckConstraint("CK_REMISION_CANTIDAD", "cantidad_entregada_lote > 0");
        });
        builder.HasKey(remision => remision.IdRemision);

        builder.Property(remision => remision.IdRemision).HasColumnName("id_remision");
        builder.Property(remision => remision.IdDespacho).HasColumnName("id_despacho").IsRequired();
        builder.Property(remision => remision.IdDetallePedido).HasColumnName("id_detalle_pedido").IsRequired();
        builder.Property(remision => remision.CantidadEnviada).HasColumnName("cantidad_entregada_lote").IsRequired();
        builder.Property(remision => remision.FechaRegistro).HasColumnName("fecha_registro").HasDefaultValueSql("GETDATE()").IsRequired();
        builder.Property(remision => remision.FirmaRecibido).HasColumnName("firma_recibido").HasMaxLength(255).IsRequired();

        builder
            .HasOne(remision => remision.Despacho)
            .WithMany(despacho => despacho.Remisiones)
            .HasForeignKey(remision => remision.IdDespacho)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(remision => remision.DetallePedido)
            .WithMany(detalle => detalle.Remisiones)
            .HasForeignKey(remision => remision.IdDetallePedido)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
