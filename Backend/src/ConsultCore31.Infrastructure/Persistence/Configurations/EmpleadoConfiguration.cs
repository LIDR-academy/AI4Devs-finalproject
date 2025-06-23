using ConsultCore31.Core.Entities;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConsultCore31.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de la entidad Empleado para Entity Framework Core.
/// </summary>
public class EmpleadoConfiguration : IEntityTypeConfiguration<Empleado>
{
    /// <summary>
    /// Configura la entidad Empleado.
    /// </summary>
    /// <param name="builder">El constructor de la entidad.</param>
    public void Configure(EntityTypeBuilder<Empleado> builder)
    {
        // Configuración de la clave primaria
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("empleadoId");

        // Configuración de la relación con Usuario (inversa)
        builder.HasOne(e => e.Usuario)
            .WithOne(u => u.Empleado)
            .HasForeignKey<Usuario>(u => u.EmpleadoId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}