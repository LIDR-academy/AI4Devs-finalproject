using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class DespachoFleteConfiguration : IEntityTypeConfiguration<DespachoFlete>
{
    public void Configure(EntityTypeBuilder<DespachoFlete> builder)
    {
        builder.ToTable("DESPACHO_FLETE", table =>
        {
            table.HasCheckConstraint("CK_DESPACHO_PESO", "peso_total_carga_kg > 0");
            table.HasCheckConstraint("CK_DESPACHO_ESTADO", "estado_entrega IN ('EnRuta', 'Entregado', 'Cancelado')");
        });
        builder.HasKey(despacho => despacho.IdDespacho);

        builder.Property(despacho => despacho.IdDespacho).HasColumnName("id_despacho");
        builder.Property(despacho => despacho.IdPedido).HasColumnName("id_pedido").IsRequired();
        builder.Property(despacho => despacho.IdUsuario).HasColumnName("id_usuario").IsRequired();
        builder.Property(despacho => despacho.TipoCamion).HasColumnName("tipo_camion").HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(despacho => despacho.PesoTotalCargaKg).HasColumnName("peso_total_carga_kg").HasPrecision(9, 2).IsRequired();
        builder.Property(despacho => despacho.PlacasVehiculo).HasColumnName("placas_vehiculo").HasMaxLength(50).IsRequired();
        builder.Property(despacho => despacho.DireccionEntrega).HasColumnName("direccion_entrega").HasMaxLength(255).IsRequired();
        builder.Property(despacho => despacho.IndicacionesDescarga).HasColumnName("indicaciones_descarga").HasMaxLength(255).IsRequired();
        builder.Property(despacho => despacho.FechaSalida).HasColumnName("fecha_salida");
        builder.Property(despacho => despacho.FechaEntregaReal).HasColumnName("fecha_entrega_real");
        builder.Property(despacho => despacho.EstadoEntrega).HasColumnName("estado_entrega").HasConversion<string>().HasMaxLength(30).IsRequired();

        builder.HasIndex(despacho => despacho.EstadoEntrega);

        builder
            .HasOne(despacho => despacho.Pedido)
            .WithMany(pedido => pedido.Despachos)
            .HasForeignKey(despacho => despacho.IdPedido)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(despacho => despacho.Usuario)
            .WithMany(usuario => usuario.Despachos)
            .HasForeignKey(despacho => despacho.IdUsuario)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
