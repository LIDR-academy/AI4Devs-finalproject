using ConsultCore31.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConsultCore31.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de la entidad AsignacionViatico para Entity Framework Core.
/// </summary>
public class AsignacionViaticoConfiguration : IEntityTypeConfiguration<AsignacionViatico>
{
    /// <summary>
    /// Configura la entidad AsignacionViatico.
    /// </summary>
    /// <param name="builder">El constructor de la entidad.</param>
    public void Configure(EntityTypeBuilder<AsignacionViatico> builder)
    {
        // Configuración de la clave primaria
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnName("asignacionViaticoId");
        
        // Configuración de la relación con Proyecto
        builder.HasOne(a => a.Proyecto)
            .WithMany(p => p.AsignacionesViatico)
            .HasForeignKey(a => a.ProyectoId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configuración de la relación con Empleado
        builder.HasOne(a => a.Empleado)
            .WithMany()
            .HasForeignKey(a => a.EmpleadoId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configuración de la relación con Moneda
        builder.HasOne(a => a.Moneda)
            .WithMany()
            .HasForeignKey(a => a.MonedaId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configuración de la relación con EstadoAprobacion
        builder.HasOne(a => a.EstadoAprobacion)
            .WithMany()
            .HasForeignKey(a => a.EstadoAprobacionId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configuración de la relación con Usuario (AprobadoPor)
        builder.HasOne(a => a.AprobadoPor)
            .WithMany()
            .HasForeignKey(a => a.AprobadoPorId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
