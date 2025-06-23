using ConsultCore31.Core.Entities;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConsultCore31.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de la entidad Perfil para Entity Framework Core.
/// </summary>
public class PerfilConfiguration : IEntityTypeConfiguration<Perfil>
{
    /// <summary>
    /// Configura la entidad Perfil.
    /// </summary>
    /// <param name="builder">El constructor de la entidad.</param>
    public void Configure(EntityTypeBuilder<Perfil> builder)
    {
        // Configuración de la tabla
        builder.ToTable("Perfiles", "dbo");

        // Configuración de la clave primaria
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("perfilId");

        // Mapeo de propiedades
        builder.Property(p => p.PerfilNombre)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("perfilNombre");

        builder.Property(p => p.PerfilActivo)
            .IsRequired()
            .HasDefaultValue(true)
            .HasColumnName("perfilActivo");

        builder.Property(p => p.ObjetoId)
            .IsRequired()
            .HasColumnName("objetoId");

        // Configuración de la relación con Objeto
        builder.HasOne(p => p.Objeto)
            .WithMany()
            .HasForeignKey(p => p.ObjetoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de la relación con Usuario
        builder.HasMany(p => p.Usuarios)
            .WithOne(u => u.Perfil)
            .HasForeignKey(u => u.PerfilId)
            .HasConstraintName("FK_Usuario_Perfil")
            .OnDelete(DeleteBehavior.Restrict);

        // Configuración de la relación con Acceso
        builder.HasMany(p => p.Accesos)
            .WithOne(a => a.Perfil)
            .HasForeignKey(a => a.PerfilId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}