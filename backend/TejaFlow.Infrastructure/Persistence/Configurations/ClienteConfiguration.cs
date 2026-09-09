using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("CLIENTE");
        builder.HasKey(cliente => cliente.IdCliente);

        builder.Property(cliente => cliente.IdCliente).HasColumnName("id_cliente");
        builder.Property(cliente => cliente.RazonSocial).HasColumnName("razon_social").HasMaxLength(150).IsRequired();
        builder.Property(cliente => cliente.RfcNit).HasColumnName("rfc_nit").HasMaxLength(20).IsRequired();
        builder.Property(cliente => cliente.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
        builder.Property(cliente => cliente.Telefono).HasColumnName("telefono").HasMaxLength(20).IsRequired();
        builder.Property(cliente => cliente.TipoCliente).HasColumnName("tipo_cliente").HasMaxLength(30).IsRequired();
        builder.Property(cliente => cliente.DireccionEntrega).HasColumnName("direccion_entrega").HasMaxLength(255).IsRequired();

        builder.HasIndex(cliente => cliente.RfcNit).IsUnique();
        builder.HasIndex(cliente => cliente.Email);

        builder.HasData(
            new Cliente
            {
                IdCliente = 1,
                RazonSocial = "Constructora Norte SA de CV",
                RfcNit = "CNO260101AB1",
                Email = "compras@constructoranorte.test",
                Telefono = "6141000001",
                TipoCliente = "Mayorista",
                DireccionEntrega = "Av. Tecnologico 1200, Chihuahua"
            },
            new Cliente
            {
                IdCliente = 2,
                RazonSocial = "Distribuidora Techo Firme",
                RfcNit = "DTF260101AB2",
                Email = "ventas@techofirme.test",
                Telefono = "6141000002",
                TipoCliente = "Distribuidor",
                DireccionEntrega = "Carretera Aldama Km 8, Chihuahua"
            });
    }
}

