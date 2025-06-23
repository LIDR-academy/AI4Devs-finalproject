using ConsultCore31.Core.Entities;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConsultCore31.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de la entidad MovimientoViatico para Entity Framework Core.
/// </summary>
public class MovimientoViaticoConfiguration : IEntityTypeConfiguration<MovimientoViatico>
{
    /// <summary>
    /// Configura la entidad MovimientoViatico.
    /// </summary>
    /// <param name="builder">El constructor de la entidad.</param>
    public void Configure(EntityTypeBuilder<MovimientoViatico> builder)
    {
        // Configuración de la clave primaria
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("movimientoViaticoId");

        // Configuración de la relación con AsignacionViatico
        builder.HasOne(m => m.AsignacionViatico)
            .WithMany(a => a.MovimientosViatico)
            .HasForeignKey(m => m.AsignacionViaticoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de la relación con TipoMovimientoViatico
        builder.HasOne(m => m.TipoMovimientoViatico)
            .WithMany(t => t.MovimientosViatico)
            .HasForeignKey(m => m.TipoMovimientoViaticoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de la relación con CategoriaGasto
        builder.HasOne(m => m.CategoriaGasto)
            .WithMany()
            .HasForeignKey(m => m.CategoriaGastoId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de la relación con Usuario (RegistradoPor)
        builder.HasOne(m => m.RegistradoPor)
            .WithMany()
            .HasForeignKey(m => m.RegistradoPorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}