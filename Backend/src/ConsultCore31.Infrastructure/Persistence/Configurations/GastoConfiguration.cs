using ConsultCore31.Core.Entities;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConsultCore31.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de la entidad Gasto para Entity Framework Core.
/// </summary>
public class GastoConfiguration : IEntityTypeConfiguration<Gasto>
{
    /// <summary>
    /// Configura la entidad Gasto.
    /// </summary>
    /// <param name="builder">El constructor de la entidad.</param>
    public void Configure(EntityTypeBuilder<Gasto> builder)
    {
        // Configuración de la clave primaria
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasColumnName("gastoId");

        // Configuración de la relación con Proyecto
        builder.HasOne(g => g.Proyecto)
            .WithMany(p => p.Gastos)
            .HasForeignKey(g => g.ProyectoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de la relación con CategoriaGasto
        builder.HasOne(g => g.CategoriaGasto)
            .WithMany(c => c.Gastos)
            .HasForeignKey(g => g.CategoriaGastoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de la relación con EstadoAprobacion
        builder.HasOne(g => g.EstadoAprobacion)
            .WithMany(e => e.Gastos)
            .HasForeignKey(g => g.EstadoAprobacionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de la relación con Moneda
        builder.HasOne(g => g.Moneda)
            .WithMany(m => m.Gastos)
            .HasForeignKey(g => g.MonedaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}