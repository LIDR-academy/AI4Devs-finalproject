using ConsultCore31.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ConsultCore31.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuración de la entidad Usuario para Entity Framework Core.
/// </summary>
public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    /// <summary>
    /// Configura la entidad Usuario.
    /// </summary>
    /// <param name="builder">El constructor de la entidad.</param>
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        // Configuración de la tabla
        builder.ToTable("Usuarios", "dbo");
        
        // Configuración de la clave primaria
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("usuarioId");
        
        // Mapeo explícito de propiedades personalizadas
        builder.Property(u => u.UsuarioApellidos)
            .IsRequired()
            .HasMaxLength(300)
            .HasColumnName("usuarioApellidos");
            
        builder.Property(u => u.TokenUsuario)
            .HasColumnName("usuarioToken");
            
        builder.Property(u => u.UsuarioActivo)
            .IsRequired()
            .HasColumnName("usuarioActivo");
            
        builder.Property(u => u.UsuarioContrasenaRecuperacion)
            .HasMaxLength(500)
            .HasColumnName("usuarioContrasenaRecuperacion");
            
        builder.Property(u => u.PerfilId)
            .IsRequired()
            .HasColumnName("perfilId");
            
        builder.Property(u => u.EmpleadoId)
            .IsRequired(false)
            .HasColumnName("empleadoId");
            
        builder.Property(u => u.ObjetoId)
            .IsRequired()
            .HasColumnName("objetoId");
            
        builder.Property(u => u.UsuarioNumero)
            .HasColumnName("usuarioNumero");
            
        builder.Property("_usuarioContrasena")
            .HasColumnName("usuarioContrasena")
            .HasColumnType("varbinary(500)");
        
        // Configuración de la relación con Perfil
        builder.HasOne(u => u.Perfil)
            .WithMany(p => p.Usuarios)
            .HasForeignKey(u => u.PerfilId)
            .HasConstraintName("FK_Usuario_Perfil")
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configuración de la relación con Empleado
        builder.HasOne(u => u.Empleado)
            .WithOne(e => e.Usuario)
            .HasForeignKey<Usuario>(u => u.EmpleadoId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configuración de la relación con Objeto
        builder.HasOne(u => u.Objeto)
            .WithMany(o => o.Usuarios)
            .HasForeignKey(u => u.ObjetoId)
            .HasConstraintName("FK_Usuario_Objeto")
            .OnDelete(DeleteBehavior.Restrict);
            
        // Configuración de la relación con RefreshTokens
        builder.HasMany(u => u.RefreshTokens)
            .WithOne(rt => rt.Usuario)
            .HasForeignKey(rt => rt.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Ignorar propiedades que no deben ser mapeadas a la base de datos
        builder.Ignore(u => u.UsuarioContrasena);
    }
}
