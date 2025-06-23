using ConsultCore31.Core.Entities;

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

        // Configuración de la propiedad MenuId
        builder.Property(o => o.MenuId)
            .IsRequired(false)
            .HasColumnName("menuId");

        // Relación con ObjetoTipo
        builder.HasOne(o => o.ObjetoTipo)
            .WithMany(ot => ot.Objetos)
            .HasForeignKey(o => o.ObjetoTipoId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relación con Menu - Configuración explícita para evitar MenuId1
        builder.HasOne(o => o.Menu)
            .WithMany(m => m.Objetos)  // Asegúrate de que la clase Menu tenga esta propiedad de navegación
            .HasForeignKey(o => o.MenuId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        // Índices
        builder.HasIndex(o => o.ObjetoNombre).IsUnique();
        builder.HasIndex(o => o.ObjetoTipoId);
        builder.HasIndex(o => o.MenuId).HasDatabaseName("IX_Objetos_menuId");
    }
}