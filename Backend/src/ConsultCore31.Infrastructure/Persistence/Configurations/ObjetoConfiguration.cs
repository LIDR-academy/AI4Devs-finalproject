using ConsultCore31.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConsultCore31.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de la entidad Objeto para Entity Framework Core.
/// </summary>
public class ObjetoConfiguration : IEntityTypeConfiguration<Objeto>
{
    /// <summary>
    /// Configura la entidad Objeto.
    /// </summary>
    /// <param name="builder">El constructor de la entidad.</param>
    public void Configure(EntityTypeBuilder<Objeto> builder)
    {
        // Configuración de la tabla
        builder.ToTable("Objetos", "dbo");
        
        // Configuración de la clave primaria
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasColumnName("objetoId");
        
        // Mapeo de propiedades
        builder.Property(o => o.ObjetoNombre)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("objetoNombre");
            
        builder.Property(o => o.ObjetoActivo)
            .IsRequired()
            .HasDefaultValue(true)
            .HasColumnName("objetoActivo");
            
        builder.Property(o => o.ObjetoTipoId)
            .IsRequired()
            .HasColumnName("objetoTipoId");
            
        builder.Property(o => o.MenuId)
            .IsRequired(false)
            .HasColumnName("menuId");
        
        // Configuración de la relación con ObjetoTipo
        builder.HasOne(o => o.ObjetoTipo)
            .WithMany(ot => ot.Objetos)
            .HasForeignKey(o => o.ObjetoTipoId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configuración de la relación con Menu
        builder.HasOne(o => o.Menu)
            .WithMany()
            .HasForeignKey(o => o.MenuId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configuración de la relación con Usuario
        builder.HasMany(o => o.Usuarios)
            .WithOne(u => u.Objeto)
            .HasForeignKey(u => u.ObjetoId)
            .HasConstraintName("FK_Usuario_Objeto")
            .OnDelete(DeleteBehavior.Restrict);
            
        // Configuración de la relación con Acceso
        builder.HasMany(o => o.Accesos)
            .WithOne(a => a.Objeto)
            .HasForeignKey(a => a.ObjetoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
