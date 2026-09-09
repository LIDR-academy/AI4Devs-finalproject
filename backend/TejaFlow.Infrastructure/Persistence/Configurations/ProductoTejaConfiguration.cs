using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TejaFlow.Domain.Entities;
using TejaFlow.Domain.Enums;

namespace TejaFlow.Infrastructure.Persistence.Configurations;

public sealed class ProductoTejaConfiguration : IEntityTypeConfiguration<ProductoTeja>
{
    public void Configure(EntityTypeBuilder<ProductoTeja> builder)
    {
        builder.ToTable("PRODUCTO_TEJA", table =>
        {
            table.HasCheckConstraint("CK_PRODUCTO_TEJA_STOCK_GLOBAL", "stock_global >= 0");
            table.HasCheckConstraint("CK_PRODUCTO_TEJA_DIMENSIONES", "longitud_cm > 0 AND ancho_cm > 0 AND peso_kg > 0");
            table.HasCheckConstraint("CK_PRODUCTO_TEJA_PRECIO", "precio_base >= 0");
        });
        builder.HasKey(teja => teja.IdTeja);

        builder.Property(teja => teja.IdTeja).HasColumnName("id_teja");
        builder.Property(teja => teja.Modelo).HasColumnName("modelo").HasMaxLength(100).IsRequired();
        builder.Property(teja => teja.Material).HasColumnName("material").HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(teja => teja.Color).HasColumnName("color").HasMaxLength(50).IsRequired();
        builder.Property(teja => teja.LongitudCm).HasColumnName("longitud_cm").HasPrecision(5, 2).IsRequired();
        builder.Property(teja => teja.AnchoCm).HasColumnName("ancho_cm").HasPrecision(5, 2).IsRequired();
        builder.Property(teja => teja.PesoKg).HasColumnName("peso_kg").HasPrecision(4, 2).IsRequired();
        builder.Property(teja => teja.PrecioBase).HasColumnName("precio_base").HasPrecision(10, 2).IsRequired();
        builder.Property(teja => teja.StockGlobal).HasColumnName("stock_global").HasDefaultValue(0).IsRequired();
        builder.Property(teja => teja.StockMinimo).HasColumnName("stock_minimo_alerta").IsRequired();

        builder.HasIndex(teja => new { teja.Material, teja.Color });

        builder.HasData(
            new
            {
                IdTeja = 1,
                Modelo = "Colonial",
                Material = MaterialTeja.Barro,
                Color = "Terracota",
                LongitudCm = 42.00m,
                AnchoCm = 25.00m,
                PesoKg = 2.50m,
                PrecioBase = 22.50m,
                StockGlobal = 8000,
                StockMinimo = 1500
            },
            new
            {
                IdTeja = 2,
                Modelo = "Francesa",
                Material = MaterialTeja.Concreto,
                Color = "Grafito",
                LongitudCm = 40.00m,
                AnchoCm = 24.00m,
                PesoKg = 3.10m,
                PrecioBase = 25.90m,
                StockGlobal = 4500,
                StockMinimo = 1000
            },
            new
            {
                IdTeja = 3,
                Modelo = "Plana Solar",
                Material = MaterialTeja.Fibrocemento,
                Color = "Arena",
                LongitudCm = 44.00m,
                AnchoCm = 28.00m,
                PesoKg = 2.20m,
                PrecioBase = 31.75m,
                StockGlobal = 2200,
                StockMinimo = 800
            });
    }
}
